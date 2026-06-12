export const ABOUT_DESCRIPTION = `Bring your Fireflies meeting recordings into Twenty. When Fireflies finishes processing a call, the transcript and AI summary land on the matching CalendarEvent automatically — no copy-pasting, no extra tabs.

## What gets added to your workspace

Two new fields appear on the standard **CalendarEvent** object:

- **Transcript** — speaker-attributed rich text, e.g. *"**Sarah:** Hi there"* followed by *"**John:** Doing well, thanks"*.
- **Summary** — Fireflies' AI-generated overview of the meeting (key points, action items, decisions).

Both update in real time through a Fireflies Webhooks V2 subscription.

## How it syncs

The connector subscribes to two Fireflies V2 events:

- \`meeting.transcribed\` writes the **Transcript** field.
- \`meeting.summarized\` writes the **Summary** field.

Each webhook delivery is HMAC-SHA256 verified against your signing secret before anything touches your data.

## How calls are matched to CalendarEvents

The matcher uses provider-native identifiers — never fuzzy URL matching — so transcripts always land on the right event:

1. **Provider event ID** — Fireflies' \`calendar_id\` / \`calendar_event_uid\` against \`CalendarChannelEventAssociation.eventExternalId\`. Covers events synced from Google Calendar, including individual instances of recurring meetings.
2. **iCalUID** — Fireflies' \`calendar_id\` against \`CalendarEvent.iCalUid\`. Covers events synced from Outlook / CalDAV.

Both identifiers are populated automatically when calendars are synced into Twenty. If a recording can't be matched (orphan recording, no calendar sync configured), the webhook reports a clear skip reason and writes nothing.

## Tools for workflows and the AI chat

Beyond the automatic sync, three Fireflies tools become available in **workflows** and the **AI chat**:

- **Sync Fireflies Call** — Pull a single Fireflies call onto its CalendarEvent on demand. Useful for backfilling history or recovering from a missed webhook. Same matching rules as the webhook.
- **Search Fireflies Calls** — Keyword search across **both** meeting titles and the words spoken during meetings. Ask the AI chat *"find any call where we discussed pricing"* and it returns matching calls with titles, dates, participants, and transcript links.
- **List Fireflies Calls By Participant** — List every call a given email address attended. Great as the first step of a workflow triggered when a Person record is created, or to answer *"what calls have we had with this contact?"* from the AI chat.

## Installing

1. Open **Settings → Applications** in your Twenty workspace.
2. Find **Twenty Fireflies** in the available apps and click **Install**.

Then your admin completes the one-time wiring (see below).

## One-time setup (admin)

1. Generate an API key at [Fireflies → Integrations → Fireflies API](https://app.fireflies.ai/settings/developer-settings) and paste it into the **FIREFLIES_API_KEY** application variable.
2. Generate a long random string (\`openssl rand -hex 32\`). Paste it into the **FIREFLIES_WEBHOOK_SECRET** application variable.
3. Configure a Webhooks V2 endpoint at [Fireflies → Integrations → Webhooks V2](https://app.fireflies.ai/integrations/api/webhook):
   - **Webhook URL**: \`https://<your-twenty-domain>/webhook/fireflies\`
   - **Signing Secret**: the same value as \`FIREFLIES_WEBHOOK_SECRET\`
   - **Events**: subscribe to \`meeting.transcribed\` (required) and \`meeting.summarized\` (optional, for AI summaries)

That's it — the next call Fireflies processes will start syncing automatically.

## Limitations

What this connector intentionally does **not** support in v1:

- **Orphan calls** (recordings with no matching CalendarEvent in Twenty) are skipped — fuzzy URL matching is avoided so transcripts never land on the wrong event.
- **Per-user Fireflies accounts** — all sync goes through one workspace-shared API key set by the admin.
- **Editing transcripts in Twenty** — the field is writable in principle, but future Fireflies syncs will overwrite manual edits.
- **Speaker analytics, sentiment, action items as structured fields** — only raw transcript and summary text are synced; structured insights stay in the Fireflies dashboard.
`;
