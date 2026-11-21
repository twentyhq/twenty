# LINE

Read and answer the LINE chats of your LINE Official Account in Twenty. Each Official Account gets a message channel. Each one-on-one chat, group chat and multi-person chat the account is in gets a thread, and each LINE user who writes gets a Person.

One Official Account can be connected per workspace.

## Setup

### 1. Create a Messaging API channel

1. Create a LINE Official Account and enable the Messaging API for it in [LINE Official Account Manager](https://manager.line.biz/). This creates a Messaging API channel in the [LINE Developers Console](https://developers.line.biz/console/).
2. In the channel's **Basic settings** tab, copy the **Channel secret**.
3. In the channel's **Messaging API** tab, issue a **Channel access token (long-lived)** and copy it. Issuing a new one later revokes the old one, so reconnect in Twenty after reissuing.

### 2. Configure the app in Twenty

| Variable | Value |
| --- | --- |
| `CHANNEL_SECRET` | The channel secret, used to check the signature of every webhook. |

### 3. Connect

Connect LINE in Twenty and paste the long-lived channel access token. The app creates the Official Account's message channel.

### 4. Register the webhook

In the channel's **Messaging API** tab:

1. Set the **Webhook URL** to the live URL of the app's `receive-webhook` function, shown in its HTTP trigger settings in Twenty (it ends with `/line`), then press **Verify**.
2. Turn on **Use webhook** and **Webhook redelivery**, so messages sent while Twenty is unreachable arrive later.

In LINE Official Account Manager, under **Response settings**, turn off auto-response messages if replies should only come from Twenty, and turn on **Chat**: only then does LINE let the app mark a chat as read when it is opened in Twenty. With Chat off, LINE marks every message read as soon as it arrives.

The URL must be public HTTPS, so a Twenty running on localhost cannot receive messages.

LINE leaves out the sender of a group message posted from LINE on a computer, so those messages show an unidentified "LINE member". Edits in group chats update the imported message, and an unsent message is removed with its attachments.

## Replying

Replies written in Twenty are sent as push messages, which count against the Official Account's monthly message limit (200 a month on the free plan in Japan). The app's settings page shows how many messages were sent this month against that limit, and warns once it is reached. LINE's free reply token expires one minute after the customer's message, too soon for a reply typed by a person.

Replies can carry JPEG and PNG images up to 10 MB; each image counts as one more message against the limit. LINE has no upload API: it fetches each image from Twenty's signed file URL, so Twenty must be served over public HTTPS. Signed URLs last one day (`FILE_TOKEN_EXPIRES_IN`). LINE does not document when it fetches the image, so check that images still open on the phone after a day. LINE cannot receive other files from a bot, and videos and audio need a preview image or a duration Twenty does not have, so a reply with any other attachment is refused before anything is sent.
