# Messenger for Twenty

Brings the Facebook Messenger conversations of your Pages into Twenty and lets you answer them from Twenty.

- Incoming messages and their attachments are imported as conversations, one message channel per Page. Shared posts, reels and links show as a line of text with their link.
- Messages the Page sends from Meta Business Suite are imported too.
- Conversations can be answered from Twenty within 24 hours of the customer's last message, and up to 7 days with Meta's Human Agent feature. Attachments go up to 8 MB for images and 25 MB for other files.
- When a customer edits a message, the edit replaces its text in Twenty.
- When a customer taps a button the Page sent, such as Get Started or a menu item, the tap shows in the conversation.
- When a customer arrives from a Click-to-Messenger ad or an m.me link, the person record shows the source, the link's ref, and the ad ID and title, with the date.
- The app settings list each connected Page, whether Meta still sends its messages, any webhook field it misses, and whether its past conversations were imported. A Page Meta dropped can be resubscribed there.
- When a reply cannot be sent, or Meta stops accepting the token, the members chosen in the app settings get an alert in their inbox.
- In the app settings, an option creates an opportunity for each person who arrives from a Click-to-Messenger ad, named after the person and the ad.
- Opening a conversation in Twenty marks it as seen in Messenger.
- Messages the Page sends show whether the customer received and read them, in the **Messenger status** field.
- Each customer gets a person record named from their Messenger profile, reused for every later message on the same Page.
- On connect, past conversations are imported: the 20 most recent messages of each, as Meta allows no more.

## Setup

Each workspace uses its own Meta app. Meta allows one webhook URL per app, so one Meta app serves one workspace.

### 1. Prepare Meta

1. In the [Meta App Dashboard](https://developers.facebook.com/apps), create an app of type **Business** and add the **Messenger** product.
2. In Meta Business Suite, add the app to each Page under **All tools > Business apps**.
3. In [Business settings](https://business.facebook.com/settings), create a system user, add the app to it, and assign it each Page with full control.
4. Generate a system user token that never expires, with `pages_messaging`, `pages_manage_metadata`, `pages_read_engagement` and `pages_show_list`.
5. Copy the **App secret** from **App settings > Basic**.

### 2. Configure the app in Twenty

Install the app, then set its variables:

| Variable | Value |
| --- | --- |
| `VERIFY_TOKEN` | Any random string. Meta sends it back when you register the webhook. |
| `APP_SECRET` | The Meta **App secret**, used to check the signature of every webhook. |

### 3. Register the webhook

In the Meta App Dashboard, open **Messenger > Messenger API Settings**:

1. Set the callback URL to the live URL of the app's `receive-webhook` function, shown in its HTTP trigger settings in Twenty (it ends with `/messenger`). Set the verify token to `VERIFY_TOKEN`.
2. Subscribe to `messages`, `message_echoes`, `message_edits`, `messaging_referrals`, `messaging_postbacks`, `message_deliveries` and `message_reads`.

The URL must be public HTTPS, so a Twenty running on localhost cannot receive messages.

### 4. Connect

Connect Messenger in Twenty with the system user token. For every Page the token manages, the app subscribes the Page to the webhook and creates its message channel.

Reconnect after assigning new Pages to the system user, and once after updating the app so each Page subscribes to the new webhook fields. Meta unsubscribes a Page after an hour of failed webhook deliveries; resubscribe it from the app settings, or reconnect.

### 5. Production access

Until Meta grants Advanced Access, webhooks only arrive for people who have a role on the Meta app. To message customers, complete Business Verification and submit App Review for `pages_messaging`, `pages_manage_metadata`, `pages_read_engagement`, `pages_show_list`, the Business Asset User Profile Access feature, and the Human Agent feature for replies after 24 hours.

Without Advanced Access, people are named "Messenger user" with the last 4 digits of their Page-scoped ID, and past conversations with people outside the app are not imported. Once access is granted, disconnect and connect again to import them.

## Limitations

- Replies after 24 hours use the human agent tag and fail until Meta approves the Human Agent feature for your Meta app. Replies after 7 days are refused.
- Reactions are not imported.
- A person created as "Messenger user" before Advanced Access keeps that name; rename or merge them by hand.
- A Page-scoped ID differs on each Page, so a customer who writes to two Pages gets two person records until they are merged.
- A reply with several attachments is sent as one Messenger message per part.
- Past conversations bring only their 20 most recent messages, without attachments. The import paces itself to 2 Meta calls per second per Page, so a Page with many conversations takes a while: about 11 seconds per conversation.

## Development

- `yarn twenty dev`: start the development server and sync the app
- `yarn test:unit`: unit tests
- `yarn test`: integration tests against a local Twenty server
- `yarn lint`: lint with oxlint
- `yarn typecheck`: type-check
