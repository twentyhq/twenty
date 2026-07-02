# Call Recorder — Self-hosting setup

This guide is for Twenty **server admins**. It covers connecting Call Recorder
to the recording service (Recall.ai), the environment variables it reads, and
how to wire up the webhook.

If you're on **Twenty Cloud**, these credentials may already be configured —
check with your workspace before setting them.

## What you need to wire up

Call Recorder talks to [Recall.ai](https://recall.ai) to send bots to meetings
and to receive recordings back. Two things must be configured:

1. A **Recall.ai API key** (and optionally a region), so the app can schedule,
   update, and cancel bots.
2. A **webhook** from Recall.ai back to your deployment, so the app learns when
   a recording is ready and can ingest it.

## Server variables

Set these on the application registration after installing
(**Settings → Applications → Call Recorder**):

| Server variable | Required | Purpose |
|---|---|---|
| `RECALL_API_KEY` | Yes | Recall.ai API key for the configured region; used to schedule, update, and cancel bots. |
| `RECALL_REGION` | No | Recall.ai region for API requests. Defaults to `eu-central-1` (Europe / Frankfurt). |
| `CALL_RECORDER_RECORDING_RETENTION_HOURS` | No | How long Recall.ai retains the source media after processing. Defaults to `166` hours (6 days 22 hours), just under Recall's 168-hour free-storage window. Values above `168` may incur Recall storage charges. Twenty's ingested copy is unaffected. |
| `RECALL_WEBHOOK_SECRET` | Yes | Svix signing secret (`whsec_…`) used to verify incoming Recall webhooks. |

> **Bot behavior settings** (display name, join timing, lobby and leave
> timeouts) and the summary settings (`CALL_RECORDER_SUMMARY_ENABLED`,
> `CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT`) are **application variables**
> that a workspace admin tunes inside the app — not server variables.

## Configuring the Recall webhook

The app exposes a server webhook route that verifies the Recall/Svix signature,
advances the matching recording's lifecycle status (`JOINING` → `RECORDING` →
`PROCESSING`, or `FAILED`), and — once the recording finishes — ingests the
audio, video, and transcript. It never moves a status backward, so out-of-order
or duplicate deliveries are safe, and it returns a non-2xx response on signature
failures so Recall retries.

Use this URL on your deployment, replacing only the host:

```text
https://<your-twenty-host>/webhooks/server/9215afe6-1497-4149-a49d-e608e239bbaf
```

The ID is the **Recall webhook logic function**.

1. In the Recall.ai dashboard, create a webhook endpoint pointing at your
   deployment's webhook URL, subscribed to the **bot status-change**,
   **recording**, and **transcript** events (`bot.status_change`,
   `recording.done`, `recording.failed`, `transcript.done`,
   `transcript.failed`). Status-change drives the lifecycle; the recording and
   transcript events trigger media and transcript ingestion. Subscribing to
   status changes alone leaves ingestion to the reconciliation backstop.
2. Copy the endpoint's signing secret — it starts with `whsec_`.
3. Set it as the `RECALL_WEBHOOK_SECRET` server variable on the **Call Recorder**
   application registration.
4. Set `RECALL_API_KEY` (and optionally `RECALL_REGION`) the same way.

## Recording lifecycle

Each recording is stored as a **CallRecording** record and moves through a
lifecycle status: `SCHEDULED` → `JOINING` → `RECORDING` → `PROCESSING` →
`COMPLETED`, or `FAILED` (with a failure reason when one is available).

A recording reaches `COMPLETED` only once **both** its audio and video have been
ingested. Recall produces only the artifacts requested at bot creation (mixed
MP3 + MP4); if processing fails, the recording is marked `FAILED`.

Recall.ai retains the source media for a limited window (about seven days by
default) to stay inside its free-storage window. Twenty ingests and stores the
video, audio, and transcript in its own storage, so they remain available after
Recall's media expires.

A periodic reconciliation job runs as a safety net, pulling the latest status
from Recall and keeping recordings and bots in sync even when a real-time
webhook update is missed.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No bot joined a meeting | **Recording** was off, the event had no conference link, it wasn't synced from a connected calendar, or `RECALL_API_KEY` isn't set | Confirm the event is on, upcoming, has a video link, and came from a synced calendar; confirm `RECALL_API_KEY` is set |
| Recording never reaches `COMPLETED` | A Recall webhook was missed, or only one of audio/video was produced | The reconciliation job pulls the latest status from Recall within a few minutes; if it is marked `FAILED`, inspect the bot in the Recall dashboard |
| Transcript empty, or marked pending/failed | Recall hasn't finished async transcription yet, or transcription failed for that call | Wait for the reconciliation job to ingest the transcript; a persistent failure leaves a marker in the transcript |
| Webhook rejected with `500` (`Invalid webhook signature`, Recall keeps retrying) | `RECALL_WEBHOOK_SECRET` doesn't match the Recall endpoint's signing secret | Re-copy the `whsec_…` secret from the Recall webhook endpoint into the `RECALL_WEBHOOK_SECRET` server variable |
| Webhook rejected with `500` (`RECALL_WEBHOOK_SECRET … not set`) | `RECALL_WEBHOOK_SECRET` is not set | Set it on the application registration |
| Bot left almost immediately | No one was admitted before the lobby / empty-meeting timeout, or everyone left | Adjust the lobby / empty-meeting timeouts in the app settings (see **Customize the bot** in the README) if they're too aggressive |
| Bot joined a meeting you didn't want recorded | Recording is on by default | Set the event's **Recording** field to Off; the scheduled bot is canceled |
| Summary stays empty after the transcript arrives | Summaries are disabled, or the summarizer run failed (for example, out of AI credits) | Confirm `CALL_RECORDER_SUMMARY_ENABLED` isn't `false` and the workspace has AI credits |
| Summary shows "No summary available." | The transcript was empty or unintelligible | No action needed; this is the expected outcome for low-quality transcripts |
