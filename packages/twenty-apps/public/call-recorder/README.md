# Call Recorder

Record your meetings automatically and keep every call inside your CRM. Call
Recorder sends a recording bot to your team's calendar meetings, then stores the
video, audio, and a speaker-attributed transcript on the meeting's record —
searchable, in context, and ready for people, AI agents, and workflows to act
on.

## What this app does

1. A teammate has an upcoming meeting on a synced calendar with a video
   conference link (Zoom, Google Meet, Microsoft Teams — anything Recall.ai
   supports).
2. Because recording is on by default, the app schedules a call recorder to join
   that event shortly before it starts.
3. The bot joins under the configured display name and records the meeting's
   audio and video for its duration.
4. When the call ends, Recall.ai processes the recording; the app ingests the
   video, the audio, and a speaker-attributed transcript and stores them as a
   **Call Recording**.
5. The recording and transcript surface on the meeting's **Calendar Event**,
   under a **Call Recording** tab — ready to review, and for AI agents and
   workflows to act on.

## What gets added to your Twenty workspace

- **A "Recording Bot" field on Calendar Events.** A select field (On / Off, On
  by default) on every CalendarEvent. Leave it On to record the meeting; switch
  it Off to keep the bot out of that specific event.
- **A "Call Recording" tab on the Calendar Event record page.** A viewer with
  the meeting's video player and a speaker-attributed, timestamped transcript
  that follows along as the recording plays.
- **Call Recording records.** Each recording is stored as a standard
  **CallRecording**: the mixed audio (MP3) and video (MP4), the transcript, the
  call's actual start and end times, and a lifecycle status (`SCHEDULED` →
  `JOINING` → `RECORDING` → `PROCESSING` → `COMPLETED`, or `FAILED`), with a
  Call Recorder Failure Reason when failure details are available.
- **A default role.** A scoped application role that reads calendar events,
  participants, people, and workspace members to decide attendance, and writes
  the resulting CallRecording records, uploads recording media, and fills
  transcripts. It cannot delete records or change settings.

## How recording works

- **On by default.** Once an admin installs the app and configures Recall.ai
  credentials, every eligible meeting is recorded automatically — there is
  nothing each person has to switch on.
- **A meeting is eligible when** it is not canceled, has a conference link, has
  not ended yet, and its **Recording Bot** field is On. If any of those isn't
  true — the event was canceled, you turned recording Off, there's no video
  link, or the meeting has already ended — no bot is scheduled.
- **Opting out of a single meeting.** Open the event and set **Recording Bot**
  to Off (or do it from the calendar events list view). The app cancels any bot
  it had scheduled for that meeting.
- **Joining and leaving.** By default the bot joins one minute before the start
  time and waits in the lobby up to twenty minutes to be admitted. It leaves on
  its own if no one ever joins, or shortly after everyone else has left. These
  are all tunable — see [Application variables](#application-variables).
- **It tracks the calendar.** If a meeting's time, link, or recording
  preference changes, the app reschedules or cancels the bot to match. A
  periodic reconciliation job runs as a safety net, keeping recordings and bots
  in sync even when a real-time update is missed.

## Billing

Recording is a metered feature. Each recording is charged on its **actual call
duration** — from when the bot starts recording to when it stops — prorated, at
a rate of **1 credit per recording-hour** (1,000,000 micro-credits). A meeting
the bot never recorded (opted out, canceled, or no one showed) is not charged.

## Installing

1. Open **Settings → Applications** in your Twenty workspace.
2. Find **Call Recorder** and click **Install**.
3. A server admin completes the one-time
   [Self-hosting setup](#self-hosting-setup-admin-only) below to wire up the
   Recall.ai API key and webhook. On Twenty Cloud these may already be
   configured.

## Limitations

What this app intentionally does **not** do in v1:

- **Recording is workspace-wide, not per person.** When the app is installed,
  every eligible meeting is recorded by default; there is no per-user "record
  my meetings" toggle yet. Control is per-meeting via the **Recording Bot**
  field. Per-user opt-in/out is planned for a later version.
- **The meeting must be a synced calendar event with a conference link.** The
  bot is scheduled from CalendarEvents that Twenty has synced from a connected
  calendar (Google / Outlook / CalDAV) and that carry a video-conference link.
  Ad-hoc calls that were never on a synced calendar are not recorded.
- **A recording completes only when both its audio and video are ingested.**
  Recall produces only the artifacts requested at bot creation (mixed MP3 +
  MP4); a recording reaches `COMPLETED` once both have been stored. If
  processing fails, it is marked `FAILED`.
- **Recall.ai media is temporary; Twenty's copy is not.** Recall retains the
  source media for a limited window (about seven days by default) to stay
  inside its free-storage window. Twenty ingests and stores the video, audio,
  and transcript in its own storage, so they remain available after Recall's
  media expires.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No bot joined a meeting | **Recording Bot** was Off, the event had no conference link, it wasn't synced from a connected calendar, or `RECALL_API_KEY` isn't set | Confirm the event is On, upcoming, has a video link, and came from a synced calendar; admin: confirm `RECALL_API_KEY` is set |
| Recording never reaches `COMPLETED` | A Recall webhook was missed, or only one of audio/video was produced | The reconciliation job pulls the latest status from Recall within a few minutes; if it is marked `FAILED`, inspect the bot in the Recall dashboard |
| Transcript empty, or marked pending/failed | Recall hasn't finished async transcription yet, or transcription failed for that call | Wait for the reconciliation job to ingest the transcript; a persistent failure leaves a marker in the transcript |
| Webhook rejected with `500` (`Invalid webhook signature`, Recall keeps retrying) | `RECALL_WEBHOOK_SECRET` doesn't match the Recall endpoint's signing secret | Re-copy the `whsec_…` secret from the Recall webhook endpoint into the `RECALL_WEBHOOK_SECRET` server variable |
| Webhook rejected with `500` (`RECALL_WEBHOOK_SECRET … not set`) | `RECALL_WEBHOOK_SECRET` is not set | Admin: set it on the application registration |
| Bot left almost immediately | No one was admitted before the lobby / no-one-joined timeout, or everyone left | Adjust `CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS` / `CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS` if too aggressive |
| Bot joined a meeting you didn't want recorded | Recording is on by default | Set the event's **Recording Bot** field to Off; the scheduled bot is canceled |

---

## Self-hosting setup (admin-only)

This section is for Twenty server admins. If you're on Twenty Cloud, the
credentials may already be configured.

### Server variables

Set these on the application registration after installing (Settings →
Applications → Call Recorder):

| Server variable | Required | Purpose |
|---|---|---|
| `RECALL_API_KEY` | Yes | Recall.ai API key for the configured region; used to schedule, update, and cancel bots. |
| `RECALL_REGION` | No | Recall.ai region for API requests. Defaults to `eu-central-1` (Europe / Frankfurt). |
| `CALL_RECORDER_RECORDING_RETENTION_HOURS` | No | How long Recall.ai retains the source media after processing. Defaults to `166` hours (6 days 22 hours), just under Recall's 168-hour free-storage window. Values above `168` may incur Recall storage charges. Twenty's ingested copy is unaffected. |
| `RECALL_WEBHOOK_SECRET` | Yes | Svix signing secret (`whsec_…`) used to verify incoming Recall webhooks. |

### Application variables

A workspace admin can tune bot behavior through application variables:

| Application variable | Default | Purpose |
|---|---|---|
| `CALL_RECORDER_NAME` | `Twenty.com` | Display name the bot uses when it joins a call. |
| `CALL_RECORDER_JOIN_EARLY_MINUTES` | `1` | Minutes before the start time the bot joins. Set to `0` to join at the scheduled start. |
| `CALL_RECORDER_WAITING_ROOM_TIMEOUT_SECONDS` | `1200` | Seconds the bot waits in the lobby before giving up and leaving. |
| `CALL_RECORDER_NOONE_JOINED_TIMEOUT_SECONDS` | `1200` | Seconds the bot stays in an empty meeting when no one else ever joins. |
| `CALL_RECORDER_EVERYONE_LEFT_TIMEOUT_SECONDS` | `2` | Seconds the bot keeps recording after everyone else leaves. |

### Configuring the Recall webhook

The app exposes a server webhook route that verifies the Recall/Svix signature,
advances the matching CallRecording's lifecycle status (`JOINING` → `RECORDING`
→ `PROCESSING`, or `FAILED`), and — once the recording finishes —
ingests the audio, video, and transcript. It never moves a status backward, so
out-of-order or duplicate deliveries are safe, and it returns a non-2xx response
on signature failures so Recall retries.

Use this URL on your deployment, replacing only the host:

```text
https://<your-twenty-host>/webhooks/server/8da4b8b5-5edf-4880-b51f-ab6e679ec617/9215afe6-1497-4149-a49d-e608e239bbaf
```

The first ID is the **Call Recorder application registration**. The second
ID is the **Recall webhook logic function**.

1. In the Recall.ai dashboard, create a webhook endpoint pointing at your
   deployment's webhook URL, subscribed to the **bot status-change**,
   **recording**, and **transcript** events (`bot.status_change`,
   `recording.done`, `recording.failed`, `transcript.done`,
   `transcript.failed`). Status-change drives the lifecycle; the recording and
   transcript events trigger media and transcript ingestion. Subscribing to
   status changes alone leaves ingestion to the reconciliation backstop.
2. Copy the endpoint's signing secret — it starts with `whsec_`.
3. Set it as the `RECALL_WEBHOOK_SECRET` server variable on the
   **Call Recorder** application registration.
4. Set `RECALL_API_KEY` (and optionally `RECALL_REGION`) the same way.
