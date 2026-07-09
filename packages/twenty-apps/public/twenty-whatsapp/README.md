# WhatsApp

**Send and receive WhatsApp messages from your CRM.**

## What you get

- **WhatsApp as a messaging channel** — connect a WhatsApp Business account
  through Meta OAuth and Twenty sends outbound messages through the WhatsApp
  Cloud API.
- **Inbound sync** — incoming WhatsApp messages are delivered to Twenty
  through the Meta webhook and stored as messages on the connected channel,
  with contacts created automatically.
- **A WhatsApp tab** on person and company record pages showing the
  conversation history with that contact.

## Setup

1. Create a Meta app with the WhatsApp product enabled and set the
   `META_APP_ID`, `META_APP_SECRET`, and `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   server variables on this app registration.
2. Point the Meta webhook to `/s/whatsapp/webhook` on your Twenty server and
   use the same verify token.
3. Connect your WhatsApp Business account from Twenty, then set the
   `WHATSAPP_PHONE_NUMBER_ID` application variable. The message channel is
   created automatically when the account is connected.
