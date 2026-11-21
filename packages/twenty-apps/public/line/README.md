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
