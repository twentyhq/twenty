This is a [Twenty](https://twenty.com) application bootstrapped with [`create-twenty-app`](https://www.npmjs.com/package/create-twenty-app).

## Getting Started

This app was scaffolded with a local Twenty server running at [http://localhost:2020](http://localhost:2020).

Login with the default development credentials: `tim@apple.dev` / `tim@apple.dev`.

Run `yarn twenty help` to list all available commands.

## Useful Commands

- `yarn twenty dev` - Start the development server and sync your app
- `yarn twenty docker:status` - Check the local Twenty server status
- `yarn twenty docker:start` - Start the local Twenty server
- `yarn test` - Run integration tests

## Recall.ai configuration

This app schedules Recall.ai meeting bots and ingests their lifecycle events.

A server admin configures Recall credentials through server variables on the application registration (Settings → Applications → Twenty Meeting Bot):

| Server variable | Required | Purpose |
| --- | --- | --- |
| `RECALL_API_KEY` | Yes | Recall.ai API key for the configured region; used to schedule, update, and cancel bots. |
| `RECALL_REGION` | No | Recall.ai region for API requests. Defaults to `eu-central-1`. |
| `RECALL_WEBHOOK_SECRET` | Yes | Svix signing secret (`whsec_…`) used to verify incoming Recall webhooks. |

A workspace admin can adjust bot behavior through application variables:

| Application variable | Default | Purpose |
| --- | --- | --- |
| `RECALL_BOT_NAME` | `Twenty Meeting Bot` | Display name used when scheduling Recall.ai meeting bots. |
| `RECALL_BOT_JOIN_EARLY_MINUTES` | `1` | How many minutes before the meeting start time the bot should join. Set to `0` to join at the scheduled start time. |
| `RECALL_BOT_WAITING_ROOM_TIMEOUT_SECONDS` | `1200` | How many seconds the bot waits in a meeting lobby before giving up and leaving. |
| `RECALL_BOT_NOONE_JOINED_TIMEOUT_SECONDS` | `1200` | How many seconds the bot stays in an empty meeting when no one else ever joins. |
| `RECALL_BOT_EVERYONE_LEFT_TIMEOUT_SECONDS` | `2` | How many seconds the bot keeps recording after everyone else leaves the meeting. |

### Configuring the webhook

The app exposes an unauthenticated route, `POST /webhook/recall`, that verifies the Recall/Svix signature and updates the matching `CallRecording`'s lifecycle status (`JOINING` → `RECORDING` → `PROCESSING`, or `FAILED_UNKNOWN`).

1. In the Recall.ai dashboard, create a webhook endpoint (Status Change Webhooks) pointing at the public URL of this app's `POST /webhook/recall` route.
2. Copy the endpoint's signing secret — it starts with `whsec_`.
3. Set it as the `RECALL_WEBHOOK_SECRET` server variable on the Twenty Meeting Bot application registration.

The handler ignores out-of-order or duplicate deliveries (it never moves a recording's status backwards) and returns a non-2xx response on signature failures so Recall retries.

## Learn More

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
- [Discord](https://discord.gg/cx5n4Jzs57)
