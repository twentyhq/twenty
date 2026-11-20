# WhatsApp for Twenty

Brings WhatsApp Business conversations into Twenty and lets agents and workflows send WhatsApp template messages.

- Incoming messages, media, edits and deletions are imported as conversations, one channel per business phone number. Messages the business sends from the WhatsApp Business app are imported too.
- Conversations can be answered from Twenty, with attachments in the formats and sizes WhatsApp accepts. Opening a conversation marks it as read on WhatsApp.
- Messages sent by the business show their WhatsApp delivery status (sent, delivered, read or failed, with the reason). Messages that are not delivered are reported to the inboxes of the members chosen in the app settings.
- Senders are matched to existing people by WhatsApp ID or phone number, or created. Users who hide their number behind a username are matched by their business-scoped user ID.
- Message templates are imported and kept in sync. Templates can be edited and deleted from their records with **Edit in WhatsApp** and **Delete in WhatsApp**.
- Select people, or a whole filtered view, and run **Send WhatsApp template** to send a template as a campaign. Each parameter is either the same text for everyone or a person field such as the first name, with a preview and a confirmation of the number of recipients. People without a number, opted out of marketing, or missing a personalized value are skipped; up to 1,000 people per campaign.
- **WhatsApp campaigns** lists each campaign with its queued, sent, delivered, read, replied, failed and skipped counts, refreshed as statuses and replies arrive. Sent templates also appear in each recipient's conversation.
- The app settings show each phone number's quality rating and messaging limit, and the messages sent, delivered and their cost over the last 30 days.
- AI tools: `create-template`, `edit-template`, `delete-template`, `send-template-message`, and `send-interactive-message` for reply buttons and lists within the 24 hour window.
- When someone stops or resumes WhatsApp marketing messages, the **WhatsApp marketing opt-out** field on their person record is updated, and marketing templates are no longer sent to them. A marketing send that Meta rejects because of an earlier opt-out also sets it.
- Account alerts, reviews and phone number quality changes are sent to the same inboxes.

## Setup

### 1. Prepare Meta

1. Create an app of type **Business** in the [Meta App Dashboard](https://developers.facebook.com/apps) and add the **WhatsApp** product.
2. In [Business settings](https://business.facebook.com/settings), create a system user, assign it your WhatsApp Business Account, and generate a token that never expires with the `whatsapp_business_management` and `whatsapp_business_messaging` permissions.
3. Copy the **App secret** from **App settings > Basic**.

### 2. Configure the app in Twenty

Install the app, then set its variables:

| Variable | Value |
| --- | --- |
| `VERIFY_TOKEN` | Any random string. Meta sends it back when you register the webhook. |
| `WEBHOOK_VALIDATION_SECRET` | The Meta **App secret**, used to check the signature of every webhook. |

### 3. Register the webhook

In the Meta App Dashboard, open **WhatsApp > Configuration**:

1. Set the callback URL to the live URL of the app's `webhook-sync` function, shown in its HTTP trigger settings in Twenty (it ends with `/whatsapp`), and the verify token to `VERIFY_TOKEN`.
2. Subscribe to `messages`, `history`, `smb_message_echoes`, `user_preferences`, `message_template_status_update`, `message_template_quality_update`, `message_template_components_update`, `template_category_update`, `account_alerts`, `account_review_update`, `account_update`, `phone_number_quality_update` and `security`.

### 4. Connect

Connect WhatsApp in Twenty with the system user token. For every WhatsApp Business Account the token can manage, the app subscribes to its webhooks, creates a message channel per phone number and imports its templates. Phone numbers added later get their channel with their first message.

Reconnect after the token changes or loses access to an account, and once after updating the app so existing channels can send replies.

## Limitations

- WhatsApp only delivers free-form replies within 24 hours of the customer's last message, so later replies are refused; send a template instead.
- A reply with several attachments is sent as one WhatsApp message per part, and only the first carries the delivery status.
- Conversations that were already split in two before this version stay split; new messages join the existing thread.
- Media older than two weeks in an imported history is shown as unavailable, because Meta no longer sends it.

## Development

- `yarn twenty dev` - Start the development server and sync the app
- `yarn lint` - Lint with oxlint
- `yarn typecheck` - Type-check
- `yarn test:unit` - Run unit tests
- `yarn test` - Run integration tests against a local Twenty server, using the globally installed `twenty` CLI (or `TWENTY_CLI`)
