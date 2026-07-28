# Fireflies for Twenty

Sync [Fireflies](https://fireflies.ai) call transcripts and AI summaries into
`CallRecording` records linked to the matching `CalendarEvent` in your Twenty
CRM — searchable, in context, and ready for AI agents and workflows to act
on. Plus on-demand workflow tools to sync, list, and search Fireflies calls
from the AI chat or workflow builder.

## What this app does

1. Fireflies records and transcribes your Zoom / Meet / Teams / phone call.
2. When the transcript is ready, Fireflies fires a `meeting.transcribed`
   webhook; once Fireflies finishes its AI summary, it fires a separate
   `meeting.summarized` webhook.
3. For each event, this app fetches the relevant data via the Fireflies
   GraphQL API.
4. It upserts a `CallRecording` record (one per Fireflies call) with the
   diarized transcript and the AI summary, linked to the matching
   `CalendarEvent` when one is found.

Alongside the webhook, three [Workflow tools](#workflow-tools) let you
trigger Fireflies actions from the AI chat or as steps inside a workflow,
without waiting for Fireflies to push.

### How a transcript is matched to a CalendarEvent

The matcher tries two provider-ID strategies in priority order and stops at
the first hit:

1. **Provider-native event ID** — Fireflies' `calendar_id` / `cal_id` is
   matched against `CalendarChannelEventAssociation.eventExternalId`. Covers
   events synced into Twenty from Google Calendar (including individual
   instances of recurring events, where Fireflies returns the per-instance
   id with timestamp on `cal_id`).
2. **iCalUID** — Fireflies' `calendar_id` is matched against
   `CalendarEvent.iCalUid`. Covers events synced from Outlook / CalDAV,
   where Fireflies returns the RFC 5545 iCalUID directly.

Both identifiers are populated by Twenty's calendar drivers on every synced
CalendarEvent, so any meeting that's been pulled in via Google / Outlook /
CalDAV calendar sync will match exactly. The matcher does **not** fall back
to fuzzy URL matching — if the transcript can't be tied to a synced calendar
event, the CallRecording is still created, just without a linked calendar
event. This avoids silently linking transcripts to the wrong event.

## What gets added to your Twenty workspace

The app writes to the standard **CallRecording** object (no new schema):

- One CallRecording per Fireflies call, with a deterministic id — the
  `meeting.transcribed` webhook, the `meeting.summarized` webhook, and manual
  syncs all converge on the same record.
- **Transcript** — the diarized transcript (speaker names and sentence-level
  timestamps) stored in the CallRecording `transcript` field.
- **Summary** — the Fireflies AI summary (overview, action items, topics,
  keywords) stored as rich text in the CallRecording `summary` field.
- **Title, start/end time, external recording id, and the CalendarEvent
  link** filled from the Fireflies call metadata.

Plus three workflow tools — see [Workflow tools](#workflow-tools) below.

## Workflow tools

Once the API key is configured, three tools become available in the workflow
builder and the AI chat — covering the cases the webhook can't:

- **Sync Fireflies Call** — *"sync the Fireflies call `01HXYZ...` into a
  CallRecording now"*. As a workflow step: provide `transcriptId`. Runs the
  same pipeline as the webhook (fetch transcript + AI summary, find matching
  CalendarEvent, upsert the CallRecording) on demand. Use cases:
  **backfilling** historical calls that happened before the app was
  installed; **recovering** from a missed webhook (e.g. the calendar event
  hadn't synced yet when Fireflies pushed); or triggering a sync from a
  workflow instead of waiting for Fireflies. Output includes
  `callRecordingId`, `calendarEventId`, `updatedFields`, and a per-field
  outcome breakdown so partial successes are visible.
- **List Fireflies Calls By Participant** — *"show me my last 5 calls with
  john@acme.com"*. As a workflow step: provide `participantEmail` (and
  optional `limit`, max 50). Returns recent Fireflies calls — newest first —
  where that email was an attendee, with title, date, duration, host, and
  transcript URL. The natural first step in workflows triggered on
  `Person.created` — *"find what we've talked about with this contact"*.
- **Search Fireflies Calls** — *"find any call where we discussed pricing"*.
  As a workflow step: provide `keyword` (and optional `limit`, max 50).
  Matches the keyword against both meeting titles and the words actually
  spoken in meetings. Returns the same call-summary shape as the
  participant tool. Best for AI-chat-driven research.

The list-by-participant and search tools return the same compact call shape:
`id`, `title`, `date`, `durationMinutes`, `participants`, `hostEmail`,
`transcriptUrl`, `meetingLink`. To then sync any of those calls into a
CallRecording, pass the `id` from a list result into **Sync Fireflies Call**.

## Installing

1. Open **Settings → Applications** in your Twenty workspace.
2. Find **Fireflies** in the available apps and click **Install**.
3. Follow [Self-hosting setup](#self-hosting-setup-admin-only) below to wire
   up the API key and webhook (admin-only, one-time).

> **Heads up:** if you see *"Fireflies is not configured"* on the first
> webhook, your Twenty admin needs to follow the
> [Self-hosting setup](#self-hosting-setup-admin-only) section.

## Upgrading from 0.1.x

Version 0.1.x stored transcripts and summaries as two rich-text fields on
CalendarEvent. Upgrading removes those fields **and their stored content** —
recordings now live on the standard CallRecording object instead.

The removed content is a cache of Fireflies data: any call still available
in Fireflies can be re-ingested as a CallRecording by passing its id to
**Sync Fireflies Call** (find ids with the list / search tools). An
automatic history backfill on install and upgrade is planned as a follow-up.

## Limitations

What this connector intentionally does **not** support in v1:

- **Audio / video media ingestion.** Fireflies' `audio_url` / `video_url`
  are not downloaded yet; the CallRecording holds the transcript and summary
  only. Media ingestion is planned for a follow-up.
- **Fireflies sentiment, speaker analytics, transcript chapters.** Only
  the raw transcript and the AI summary (overview, action items, topics,
  keywords) are synced today.
- **Calls without a matching CalendarEvent (orphan calls).** These are no
  longer skipped — the CallRecording is created — but it stays unlinked
  until the calendar event syncs; re-running **Sync Fireflies Call** after
  the calendar sync fills the link.
- **Per-user Fireflies accounts.** All transcripts come through one
  workspace-shared API key (set by the admin). Per-user OAuth-style
  connections require extending Twenty's connection provider system and are
  planned once we have evidence that workspace-shared is too coarse.
- **Editing transcripts or summaries in Twenty.** The CallRecording fields
  are writable but the next Fireflies sync overwrites any manual edits —
  treat them as read-only.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Webhook returns `Fireflies is not configured` | `FIREFLIES_API_KEY` not set | Admin: paste the API key in **Settings → Applications → Fireflies → Settings** |
| Webhook returns `Invalid webhook signature` | `FIREFLIES_WEBHOOK_SECRET` mismatch between Fireflies and Twenty | Re-copy the signing secret from the Fireflies webhook configuration and paste it into the Twenty app settings |
| CallRecording is created but has no linked CalendarEvent | The meeting was never on a synced calendar in Twenty, or the workspace has no Google/Outlook/CalDAV calendar connection set up | Connect the relevant calendar provider in **Settings → Accounts** so the calendar event lands in Twenty with `eventExternalId` and `iCalUid` populated, then re-run **Sync Fireflies Call** for that transcript. Manually-created CalendarEvents are intentionally not matched in v1 |
| Transcript appears empty | Fireflies returned no sentences (call too short, audio failed) | Check the call in the Fireflies dashboard; nothing this app can do |
| Summary appears empty | Fireflies hasn't summarized the call yet, or the call was too short to summarize | Fireflies sends `meeting.summarized` separately from `meeting.transcribed` (typically a minute or two later); ensure that event is subscribed to in your Webhooks V2 config |
| Summary is populated but Transcript isn't (or vice versa) | Only one of the two Fireflies events is subscribed to | Subscribe to both `meeting.transcribed` and `meeting.summarized` in your Fireflies Webhooks V2 configuration |
| Fireflies API errors with `401` | API key wrong, rotated, or revoked | Generate a new key in Fireflies → Integrations → Fireflies API → Regenerate, then update `FIREFLIES_API_KEY` |
| **Sync Fireflies Call** reports `No CallRecording was written` | Fireflies returned no transcript sentences and no summary for the call, or the per-field outcomes show transient Fireflies API failures | Check the `fieldOutcomes` array in the result — `skipped` means Fireflies had no content for that field; `error` means Fireflies-side failure (retry, or inspect the error message) |
| **List / Search** tools return `count: 0` for a contact you've definitely talked to | Email mismatch — Fireflies stores the address as the participant joined the meeting with, which may differ from the contact's primary address in Twenty (aliases, plus-addressing, work vs. personal) | Try the contact's other known email addresses; cross-check the `participants` list on a known matching call |

---

## Self-hosting setup (admin-only)

This section is for Twenty server admins. If you're on Twenty Cloud, skip
this — the credentials may already be configured.

### 1. Generate a Fireflies API key

1. Visit https://app.fireflies.ai and sign in.
2. Go to **Integrations → Fireflies API**.
3. Click **Generate API key** and copy the value (it's only shown once).

### 2. Configure a Webhooks V2 endpoint in Fireflies

This integration targets [Fireflies Webhooks V2](https://docs.fireflies.ai/graphql-api/webhooks-v2)
(snake_case payload, granular event subscriptions). The legacy V1 webhook
format (`meetingId` / `eventType: "Transcription completed"`) is **not**
supported.

1. Open the Webhooks V2 page: https://app.fireflies.ai/integrations/api/webhook
2. Set the **Webhook URL** to your Twenty deployment's webhook endpoint:
   `https://<your-twenty-domain>/webhook/fireflies`. Twenty resolves the
   target workspace from the request's `Host` header, so the URL must match
   the workspace's public domain — `localhost` is not valid in the
   Fireflies UI. For local development, expose your dev server with a
   tunnel like `ngrok http 3000` and paste the HTTPS forwarding URL here,
   or skip the Fireflies UI entirely and POST a signed payload directly to
   your local endpoint.
3. Set a **Signing Secret** (a long random string — generate one with
   `openssl rand -hex 32`). Save it; you'll paste it into Twenty next.
4. Under **Events**, subscribe to **both**:
   - **`meeting.transcribed`** — fires when the transcript is ready and
     writes it to the CallRecording's **Transcript** field.
   - **`meeting.summarized`** — fires once Fireflies finishes its AI summary
     and writes it to the CallRecording's **Summary** field.
   Subscribing to only one is fine if you don't want the other field
   populated; the app dispatches per event.
5. **Save** the configuration.

### 3. Wire the credentials into Twenty

1. In Twenty: **Settings → Applications → Fireflies → Settings tab**.
2. Paste the Fireflies API key into the `FIREFLIES_API_KEY` row.
3. Paste the signing secret into the `FIREFLIES_WEBHOOK_SECRET` row.

After saving, the next time Fireflies finishes processing a recording, a
CallRecording with the transcript will appear (linked to the matching
CalendarEvent) within a few seconds; the summary follows once Fireflies
finishes the AI summarization step (typically a minute or two later —
Fireflies sends two separate webhooks).
