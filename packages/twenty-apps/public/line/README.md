# LINE

Read and answer the LINE chats of your LINE Official Account in Twenty. Each Official Account gets a message channel, and each LINE user who writes to it gets a thread linked to a Person.

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

In LINE Official Account Manager, under **Response settings**, turn off auto-response messages if replies should only come from Twenty.

The URL must be public HTTPS, so a Twenty running on localhost cannot receive messages.

Group and multi-person chats are not imported.

## Replying

Replies written in Twenty are sent as push messages, which count against the Official Account's monthly message limit (200 a month on the free plan in Japan). LINE's free reply token expires one minute after the customer's message, too soon for a reply typed by a person. Replies carry text only; attachments are not sent yet.
