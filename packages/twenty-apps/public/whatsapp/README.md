# WhatsApp for Twenty

Brings WhatsApp Business conversations into Twenty and lets agents and workflows send WhatsApp template messages.

- Incoming messages, media, edits and deletions are imported as conversations, one channel per business phone number.
- Senders are matched to existing people by WhatsApp ID or phone number, or created. Users who hide their number behind a username are matched by their business-scoped user ID.
- Message templates are imported and kept in sync, and can be created and sent through the `create-template` and `send-template-message` tools.
- Account alerts, reviews and phone number quality changes are sent to the inboxes of the workspace members you pick in the app settings.

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
2. Subscribe to `messages`, `history`, `message_template_status_update`, `message_template_quality_update`, `message_template_components_update`, `template_category_update`, `account_alerts`, `account_review_update`, `account_update`, `phone_number_quality_update` and `security`.

### 4. Connect

Connect WhatsApp in Twenty with the system user token. For every WhatsApp Business Account the token can manage, the app subscribes to its webhooks, creates a message channel per phone number and imports its templates. Phone numbers added later get their channel with their first message.

Reconnect after the token changes or loses access to an account.

## Limitations

- Conversations can't be answered from Twenty yet; only templates can be sent.
- Delivery statuses and messages sent from the WhatsApp Business app (`smb_message_echoes`) are not imported.
- Media older than two weeks in an imported history is shown as unavailable, because Meta no longer sends it.

## Development

- `yarn twenty dev` - Start the development server and sync the app
- `yarn lint` - Lint with oxlint
- `yarn typecheck` - Type-check
- `yarn test:unit` - Run unit tests
- `yarn test` - Run integration tests against a local Twenty server, using the globally installed `twenty` CLI (or `TWENTY_CLI`)
