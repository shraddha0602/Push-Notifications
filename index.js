'use strict'

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.pushNotification = functions.database.ref(`/notification/{user_id}/{notification_id}`).onWrite((change,context) =>{
	const user_id = context.params.user_id;
	const notification_id = context.params.notification_id;

	console.log('We have a notification to send',user_id);

	//if(!event.data.val()){
	//	return console.log('A notification has been deleted from the database',notification_id);
	//}

	const deviceToken = admin.database().ref(`/users/${user_id}/tokenId`).once('value');
	const senderId = admin.database().ref(`/notification/${user_id}/${notification_id}/fromHandyman`).once('value');

	return Promise.all([deviceToken,senderId]).then(results =>{
		const tokensSnapshot = results[0];
		const sender = results[1];

		console.log("Device Token ID: ",tokensSnapshot.val());
		console.log("Sender ID: ",sender);

		const payload ={
			notification: {
				title: "iGRAM",
				body: "Sorry, we couldn't reach you out today. We'll be at it asap",
				icon: "ic_launcher_round"
			}
		};
		return admin.messaging().sendToDevice(tokensSnapshot.val(),payload).then(response =>{
			response.results.forEach((result,index) =>{
				const error = result.error;
				if(error){
					console.error('Failure sending notification to device',tokensSnapshot.val(),error);
				}
				else{
					console.log('Notification sent to : ',tokensSnapshot.val());
				}
			});
			return null;
		});
	});
});