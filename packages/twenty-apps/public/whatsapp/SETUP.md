# Setup

WhatsApp accounts are connected through [Unipile](https://www.unipile.com) (API v2). On Twenty Cloud this is already configured; this guide is for self-hosted instances and local development.

## Prerequisites

- Node.js (version in `.nvmrc`) and Yarn 4
- A Twenty server on 2.61 or later
- A Unipile application on [dashboardv2.unipile.com](https://dashboardv2.unipile.com)
- A public HTTPS URL reaching the Twenty server, so Unipile can deliver webhooks (a tunnel such as `cloudflared tunnel --url http://localhost:3000` in development)

## 1. Configure Unipile

1. In your Unipile application, create an **Account key** (API keys → Account key). A service key also works but grants more than the app needs.
   Optionally, also create a **Service key** (API keys → Service key). With it, each workspace links its accounts in its own Unipile Scope, so the same WhatsApp account can be connected in several workspaces. Without it, Unipile refuses an account already connected in another workspace with `Account already exists`.
2. Add a webhook endpoint:
   - **URL**: `https://<twenty-server>/webhooks/server/<resolver-id>`, where `<resolver-id>` is the `id` of the `whatsapp-webhook-resolver` logic function in the app's owner workspace:

     ```graphql
     query { findManyLogicFunctions { id name } }
     ```

   - **Events**: `message.new`, `account.status.disconnected`, `account.status.errored`
   - **Accounts**: leave empty so every connected account is covered, including future ones.

The LinkedIn app can share the same Unipile application: give each app its own webhook endpoint, each one ignores the events of the other provider.

## 2. Configure Twenty

1. Install the app on its owner workspace; the webhook URL only answers once it is installed there.
2. In **Settings → Applications → WhatsApp → Application registration**, set:
   - `UNIPILE_API_KEY`: the Unipile account key
   - `UNIPILE_SERVICE_API_KEY` (optional): the Unipile service key
   - `UNIPILE_WEBHOOK_SECRET`: the webhook endpoint's signing secret
3. Members connect from **Settings → App preferences → WhatsApp**.

## How it works

| Step | Logic function | What it does |
| --- | --- | --- |
| Connect | `whatsapp-authorize`, `whatsapp-callback` | Sends the member to Unipile's hosted page, restricted to the QR code they scan from WhatsApp → Linked devices, then confirms the account it returns |
| On connect | `whatsapp-on-connect` | Creates a private message channel on the member's phone number, matched on the Person **Phones** field and bound to the `whatsapp-messaging` provider, and routes the Unipile account's webhooks to this workspace |
| Webhook | `whatsapp-webhook-resolver` | Checks the `unipile-signature` header and dispatches the event to the workspace that connected the account |
| New message | `whatsapp-handle-webhook-event` | Ingests the message into the member's channel; flags the connection when the device is unlinked from the phone |
| Reply | `whatsapp-send-message` | Sends a reply written in Twenty to the conversation's Unipile chat; the `message.new` webhook that follows is de-duplicated on the returned message id |
| Upgrade | `whatsapp-post-install` | Keeps connections made before 0.2.0 on **All chats**, their import policy until **Contacts only** became the default |
| Disconnect, uninstall | `whatsapp-on-disconnect`, `whatsapp-uninstall` | Deletes the channel and the Unipile account, which Unipile bills per connected account |

Participants are identified by their phone number, read from the `public_identifier` Unipile exposes or from a `…@s.whatsapp.net` id. Participants WhatsApp only identifies by a `…@lid` id have no known number and are left out.

Everything that talks to Unipile lives in `src/unipile` and depends on nothing else in the app, so it can be shared with other Unipile-backed apps.

## Development

```bash
yarn install
twenty app dev --create
```

- `yarn lint` — lint with oxlint
- `yarn typecheck` — type-check
- `yarn test:unit` — unit tests
- `yarn test` — integration tests, against the server in `TWENTY_API_URL`

## Troubleshooting

- **New messages do not arrive**: Unipile must have a webhook endpoint of its own for this app, pointing at `whatsapp-webhook-resolver`; the LinkedIn app's endpoint answers `Not a LinkedIn event` to WhatsApp deliveries. Check the endpoint's deliveries in the Unipile dashboard, then watch `twenty app logs --name whatsapp-handle-webhook-event`: an event that is not imported logs why.
- **The webhook answers `No workspace claims this account`**: the account's connection hook did not finish. Disconnect and reconnect WhatsApp.
- **Messages land on no Person**: the Person's **Phones** field must hold the participant's number with its calling code (`+33 6 12 34 56 78`).
- **The connection fails with `exposes no WhatsApp phone number`**: Unipile returned neither a phone number nor a `…@s.whatsapp.net` id for the account; check the account in the Unipile dashboard.
- **Every reconnection adds an account in Unipile**: remove the stale ones from the Unipile dashboard; each is billed.
