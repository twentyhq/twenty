# Setup

LinkedIn accounts are connected through [Unipile](https://www.unipile.com) (API v2). On Twenty Cloud this is already configured; this guide is for self-hosted instances and local development.

## Prerequisites

- Node.js (version in `.nvmrc`) and Yarn 4
- A Twenty server on 2.52 or later
- A Unipile application on [dashboardv2.unipile.com](https://dashboardv2.unipile.com)
- A public HTTPS URL reaching the Twenty server, so Unipile can deliver webhooks (a tunnel such as `cloudflared tunnel --url http://localhost:3000` in development)

## 1. Configure Unipile

1. In your Unipile application, create an **Account key** (API keys → Account key). A service key also works but grants more than the app needs.
2. Add a webhook endpoint:
   - **URL**: `https://<twenty-server>/webhooks/server/<resolver-id>`, where `<resolver-id>` is the `id` of the `linkedin-webhook-resolver` logic function in the app's owner workspace:

     ```graphql
     query { findManyLogicFunctions { id name } }
     ```

   - **Events**: `message.new`, `account.status.disconnected`, `account.status.errored`
   - **Accounts**: leave empty so every connected account is covered, including future ones.

## 2. Configure Twenty

1. Install the app on its owner workspace; the webhook URL only answers once it is installed there.
2. In **Settings → Applications → LinkedIn → Application registration**, set:
   - `UNIPILE_API_KEY`: the Unipile account key
   - `UNIPILE_WEBHOOK_SECRET`: the webhook endpoint's signing secret
3. Members connect from **Settings → App preferences → LinkedIn**. This page needs the `IS_APP_PREFERENCES_ENABLED` feature flag on the workspace.

## How it works

| Step | Logic function | What it does |
| --- | --- | --- |
| Connect | `linkedin-authorize`, `linkedin-callback` | Sends the member to Unipile's hosted sign-in, then confirms the account it returns |
| On connect | `linkedin-on-connect` | Creates a private message channel matched on the Person **LinkedIn** field, and routes the Unipile account's webhooks to this workspace |
| Webhook | `linkedin-webhook-resolver` | Checks the `unipile-signature` header and dispatches the event to the workspace that connected the account |
| New message | `linkedin-handle-webhook-event` | Ingests the message into the member's channel; flags the connection when LinkedIn signs the account out |
| Disconnect, uninstall | `linkedin-on-disconnect`, `linkedin-uninstall` | Deletes the channel and the Unipile account, which Unipile bills per connected account |

Unipile only exposes internal `ACo…` profile ids on messages, so the app looks up each participant's public profile URL once and caches it. LinkedIn limits profile lookups to roughly 100 a day per account.

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

- **The webhook answers `No workspace claims this account`**: the account's connection hook did not finish. Disconnect and reconnect LinkedIn.
- **Messages land on no Person**: the Person's **LinkedIn** field must hold the participant's public profile URL (`linkedin.com/in/<name>`).
- **Every reconnection adds an account in Unipile**: remove the stale ones from the Unipile dashboard; each is billed.
