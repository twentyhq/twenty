# Twenty Meeting Bot

Capture every customer conversation automatically. A meeting bot joins eligible meetings and records calls for you.

## Recall.ai configuration

This app schedules Recall.ai meeting bots and ingests their lifecycle events.

A server admin configures Recall credentials through server variables on the application registration (Settings → Applications → Twenty Meeting Bot):

| Server variable | Required | Purpose |
| --- | --- | --- |
| `RECALL_API_KEY` | Yes | Recall.ai API key for the configured region; used to schedule, update, and cancel bots. |
| `RECALL_REGION` | No | Recall.ai region for API requests. Defaults to `eu-central-1`. |
| `MEETING_BOT_RECORDING_RETENTION_HOURS` | No | How many hours Recall.ai retains recording media after processing. Defaults to `166` hours (6 days and 22 hours) to stay below Recall.ai's 7-day free storage window. Values above `168` hours may incur Recall.ai storage charges. |
| `RECALL_WEBHOOK_SECRET` | Yes | Svix signing secret (`whsec_…`) used to verify incoming Recall webhooks. |

Recall.ai retention only controls Recall.ai's copy of the recording media. Twenty stores ingested transcript and video artifacts in its own storage, so deleting Recall.ai media after the retention window does not remove the artifacts already stored in Twenty.

A workspace admin can adjust bot behavior through application variables:

| Application variable | Default | Purpose |
| --- | --- | --- |
| `MEETING_BOT_NAME` | `Twenty Meeting Bot` | Display name the meeting bot uses when it joins a call. |
| `MEETING_BOT_JOIN_EARLY_MINUTES` | `1` | How many minutes before the meeting start time the bot should join. Set to `0` to join at the scheduled start time. |
| `MEETING_BOT_WAITING_ROOM_TIMEOUT_SECONDS` | `1200` | How many seconds the bot waits in a meeting lobby before giving up and leaving. |
| `MEETING_BOT_NOONE_JOINED_TIMEOUT_SECONDS` | `1200` | How many seconds the bot stays in an empty meeting when no one else ever joins. |
| `MEETING_BOT_EVERYONE_LEFT_TIMEOUT_SECONDS` | `2` | How many seconds the bot keeps recording after everyone else leaves the meeting. |

### Configuring the webhook

The app exposes an unauthenticated route, `POST /webhook/recall`, that verifies the Recall/Svix signature and updates the matching `CallRecording`'s lifecycle status (`JOINING` → `RECORDING` → `PROCESSING`, or `FAILED_UNKNOWN`).

1. In the Recall.ai dashboard, create a webhook endpoint (Status Change Webhooks) pointing at the public URL of this app's `POST /webhook/recall` route.
2. Copy the endpoint's signing secret — it starts with `whsec_`.
3. Set it as the `RECALL_WEBHOOK_SECRET` server variable on the Twenty Meeting Bot application registration.

The handler ignores out-of-order or duplicate deliveries (it never moves a recording's status backwards) and returns a non-2xx response on signature failures so Recall retries.
