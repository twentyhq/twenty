# Fireflies for Twenty

Sync [Fireflies](https://fireflies.ai) call transcripts and AI summaries into
`CallRecording` records linked to the matching `CalendarEvent` in your Twenty
CRM — searchable, in context, and ready for AI agents and workflows to act
on. Plus on-demand workflow tools to sync, list, and search Fireflies calls
from the AI chat or workflow builder.

## What this app does

1. Fireflies records and transcribes your Zoom / Meet / Teams / phone call.
2. A daily healing job discovers recent calls from every workspace-shared
   Fireflies connection. Admins can also start a longer history backfill.
3. For each discovered call, this app fetches the transcript and summary via
   the Fireflies GraphQL API.
4. It upserts a `CallRecording` record (one per Fireflies call) with the
   diarized transcript and the AI summary, linked to the matching
   `CalendarEvent` when one is found.

Three [Workflow tools](#workflow-tools) also let you trigger Fireflies actions
from the AI chat or as steps inside a workflow.

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

- One CallRecording per Fireflies call, with a deterministic id, so calls
  visible through multiple connected accounts converge on the same record.
- **Transcript** — the diarized transcript (speaker names and sentence-level
  timestamps) stored in the CallRecording `transcript` field.
- **Summary** — the Fireflies AI summary (overview, action items, topics,
  keywords) stored as rich text in the CallRecording `summary` field.
- **Title, start/end time, external recording id, and the CalendarEvent
  link** filled from the Fireflies call metadata.

Plus three workflow tools — see [Workflow tools](#workflow-tools) below.

## Workflow tools

Once Fireflies is connected, three tools become available in the workflow
builder and the AI chat:

- **Sync Fireflies Call** — *"sync the Fireflies call `01HXYZ...` into a
  CallRecording now"*. As a workflow step: provide `transcriptId`. Runs the
  same import pipeline (fetch transcript + AI summary, find matching
  CalendarEvent, upsert the CallRecording) on demand. It searches every
  connected Fireflies account for the requested transcript. Use cases:
  **backfilling** historical calls that happened before the app was
  installed; **recovering** a call after its calendar event syncs; or
  triggering a sync from a workflow. Output includes
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
3. Open the app's **Connections** tab, click **Add connection**, choose
   **Workspace shared**, and complete the Fireflies authorization flow.
4. Repeat step 3 for every Fireflies account whose meetings should sync.

> **Heads up:** if you see *"Fireflies is not configured"*, add at least one
> workspace-shared connection. Personal connections are not used by background
> synchronization.

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
- **Personal Fireflies connections for background sync.** Background and
  manual synchronization use every workspace-shared OAuth connection.
  Personal connections are not included.
- **Real-time webhook delivery.** This version uses scheduled healing,
  history backfill, and workflow tools. Per-connection OAuth webhook
  registration will be added when Fireflies exposes it.
- **Editing transcripts or summaries in Twenty.** The CallRecording fields
  are writable but the next Fireflies sync overwrites any manual edits —
  treat them as read-only.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Fireflies reports `Fireflies is not configured` | No workspace-shared Fireflies OAuth connection exists | Open **Settings → Applications → Fireflies → Connections**, click **Add connection**, and choose **Workspace shared** |
| CallRecording is created but has no linked CalendarEvent | The meeting was never on a synced calendar in Twenty, or the workspace has no Google/Outlook/CalDAV calendar connection set up | Connect the relevant calendar provider in **Settings → Accounts** so the calendar event lands in Twenty with `eventExternalId` and `iCalUid` populated, then re-run **Sync Fireflies Call** for that transcript. Manually-created CalendarEvents are intentionally not matched in v1 |
| Transcript appears empty | Fireflies returned no sentences (call too short, audio failed) | Check the call in the Fireflies dashboard; nothing this app can do |
| Summary appears empty | Fireflies hasn't summarized the call yet, or the call was too short to summarize | Re-run **Sync Fireflies Call** after Fireflies finishes processing the summary |
| Fireflies API errors with `401` | The OAuth connection expired or was revoked | Reconnect Fireflies from the app's **Connections** tab |
| **Sync Fireflies Call** reports `No CallRecording was written` | Fireflies returned no transcript sentences and no summary for the call, or the per-field outcomes show transient Fireflies API failures | Check the `fieldOutcomes` array in the result — `skipped` means Fireflies had no content for that field; `error` means Fireflies-side failure (retry, or inspect the error message) |
| **List / Search** tools return `count: 0` for a contact you've definitely talked to | Email mismatch — Fireflies stores the address as the participant joined the meeting with, which may differ from the contact's primary address in Twenty (aliases, plus-addressing, work vs. personal) | Try the contact's other known email addresses; cross-check the `participants` list on a known matching call |

---

## Self-hosting setup (admin-only)

This section is for Twenty server admins. If you're on Twenty Cloud, skip
this — the credentials may already be configured.

### 1. Register a Fireflies OAuth app

1. Ask Fireflies to register a confidential OAuth client for your Twenty
   deployment.
2. Set the redirect URI to `<SERVER_URL>/auth/apps/callback` (for local
   development: `http://localhost:3000/auth/apps/callback`).
3. Enable the authorization-code and refresh-token grants with the
   `openid`, `meetings.read.user`, and `offline_access` scopes.
4. Copy the generated **Client ID** and **Client Secret**.

### 2. Wire the OAuth credentials into Twenty

1. In **Settings → Applications**, find **Fireflies**, open it, and go to
   the **Application registration** tab (admin-only).
2. Paste the Fireflies **Client ID** into `FIREFLIES_CLIENT_ID` and the
   **Client Secret** into `FIREFLIES_CLIENT_SECRET`.
3. In the app's **Connections** tab, click **Add connection**, choose
   **Workspace shared**, and authorize the Fireflies account used for sync.

Workspace users can now add one or more Fireflies accounts from the
**Connections** tab. The daily healer imports recent calls from every healthy
workspace-shared connection; use **Import call history** in the app settings
for a longer window.
