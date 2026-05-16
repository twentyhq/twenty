# Fireflies for Twenty

Sync [Fireflies](https://fireflies.ai) call transcripts **and AI summaries**
into your Twenty CRM. When Fireflies finishes processing a recording, the
transcript and summary are automatically written onto the matching
`CalendarEvent` record — searchable, in context, and ready for AI agents and
workflows to act on.

## What this app does

1. Fireflies records and transcribes your Zoom / Meet / Teams / phone call.
2. When the transcript is ready, Fireflies fires a `meeting.transcribed`
   webhook; once Fireflies finishes its AI summary, it fires a separate
   `meeting.summarized` webhook.
3. For each event, this app fetches the relevant data via the Fireflies
   GraphQL API.
4. It finds the matching `CalendarEvent` in Twenty and writes the content
   into either the **Transcript** or **Summary** field on that event.

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
event, the call is treated as an orphan and skipped (see
[Limitations](#limitations) below). This avoids silently writing transcripts
to the wrong event.

No clicking out to Fireflies to read what was said — every meeting in Twenty
now carries its own transcript.

## What gets added to your Twenty workspace

Two new fields on the standard **CalendarEvent** object:

- **Transcript** — rich-text field, speaker-attributed (e.g. *"**Sarah:**
  Hi there"*, then *"**John:** Doing well, thanks."*).
- **Summary** — rich-text field with the Fireflies AI summary: a bullet-list
  overview, action items grouped by speaker, topics discussed, and keywords.

## Installing

1. Open **Settings → Applications** in your Twenty workspace.
2. Find **Fireflies** in the available apps and click **Install**.
3. Follow [Self-hosting setup](#self-hosting-setup-admin-only) below to wire
   up the API key and webhook (admin-only, one-time).

> **Heads up:** if you see *"Fireflies is not configured"* in the logs on
> the first webhook, your Twenty admin needs to follow the
> [Self-hosting setup](#self-hosting-setup-admin-only) section.

## Limitations

What this connector intentionally does **not** support in v1:

- **Calls without a matching CalendarEvent (orphan calls).** Ad-hoc calls
  that were never on anyone's synced calendar are skipped. The webhook logs
  the skip reason; the transcript still lives in Fireflies. Synthetic event
  creation for orphans is planned for v2.
- **Fireflies sentiment, speaker analytics, transcript chapters.** Only
  the raw transcript and the AI summary (overview, action items, topics,
  keywords) are synced today.
- **Per-user Fireflies accounts.** All transcripts come through one
  workspace-shared API key (set by the admin). Per-user OAuth-style
  connections require extending Twenty's connection provider system and are
  planned once we have evidence that workspace-shared is too coarse.
- **Editing transcripts or summaries in Twenty.** Both fields are writable in
  principle but any future Fireflies sync would overwrite manual edits —
  treat them as read-only.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Webhook returns `Fireflies is not configured` | `FIREFLIES_API_KEY` not set | Admin: paste the API key in **Settings → Applications → Fireflies → Settings** |
| Webhook returns `Invalid webhook signature` | `FIREFLIES_WEBHOOK_SECRET` mismatch between Fireflies and Twenty | Re-copy the signing secret from the Fireflies webhook configuration and paste it into the Twenty app settings |
| Webhook returns `skipped: No CalendarEvent matched the transcript by external ID or iCalUid` | The meeting was never on a synced calendar in Twenty, or the workspace has no Google/Outlook/CalDAV calendar connection set up | Connect the relevant calendar provider in **Settings → Accounts** so the calendar event lands in Twenty with `eventExternalId` and `iCalUid` populated. Manually-created CalendarEvents are intentionally not matched in v1 |
| Transcript appears empty | Fireflies returned no sentences (call too short, audio failed) | Check the call in the Fireflies dashboard; nothing this app can do |
| Summary appears empty | Fireflies hasn't summarized the call yet, or the call was too short to summarize | Fireflies sends `meeting.summarized` separately from `meeting.transcribed` (typically a minute or two later); ensure that event is subscribed to in your Webhooks V2 config |
| Summary is populated but Transcript isn't (or vice versa) | Only one of the two Fireflies events is subscribed to | Subscribe to both `meeting.transcribed` and `meeting.summarized` in your Fireflies Webhooks V2 configuration |
| Fireflies API errors with `401` | API key wrong, rotated, or revoked | Generate a new key in Fireflies → Integrations → Fireflies API → Regenerate, then update `FIREFLIES_API_KEY` |

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
   `https://<your-twenty-domain>/webhook/fireflies`
   (local dev: see the testing instructions in the troubleshooting section
   below — Twenty's multi-tenancy requires the right Host header).
3. Set a **Signing Secret** (a long random string — generate one with
   `openssl rand -hex 32`). Save it; you'll paste it into Twenty next.
4. Under **Events**, subscribe to **both**:
   - **`meeting.transcribed`** — fires when the transcript is ready and
     writes it to the **Transcript** field.
   - **`meeting.summarized`** — fires once Fireflies finishes its AI summary
     and writes it to the **Summary** field.
   Subscribing to only one is fine if you don't want the other field
   populated; the app dispatches per event.
5. **Save** the configuration.

### 3. Wire the credentials into Twenty

1. In Twenty: **Settings → Applications → Fireflies → Settings tab**.
2. Paste the Fireflies API key into the `FIREFLIES_API_KEY` row.
3. Paste the signing secret into the `FIREFLIES_WEBHOOK_SECRET` row.

After saving, the next time Fireflies finishes processing a recording, the
transcript will land on the matching CalendarEvent within a few seconds;
the summary follows once Fireflies finishes the AI summarization step
(typically a minute or two later — Fireflies sends two separate webhooks).

---

## Why webhook instead of polling?

Fireflies recordings are inherently **async-completion events** — a call ends,
Fireflies takes 5–30 minutes to process the audio, and *then* the transcript
becomes available. Webhooks fit this shape exactly:

- Real-time delivery once the transcript is ready (no polling lag)
- No wasted API calls hitting "is anything new?" every N minutes
- Reuses Twenty's existing HTTP route trigger pattern
  (`httpRouteTriggerSettings`)

The trade-off is a public, unauthenticated endpoint — handled by HMAC-SHA256
signature verification using a shared secret.

## Why `transcript` / `summary` fields on `CalendarEvent` instead of a new object?

Twenty already models meetings as `CalendarEvent` records. Storing the
transcript and the AI summary as rich-text fields directly on the event:

- Keeps everything about a meeting in one place (no joins)
- Avoids inventing a new object that other call-recording apps would each
  need to coordinate on
- Works today without lookup fields

If we later integrate other recording tools (Gong, Otter, Zoom AI, etc.) and
find that one pair of fields is too restrictive — for example, we need to
distinguish *which* tool produced the transcript — we'll revisit and likely
promote the fields to a core platform-level concept (managed alongside
`CalendarEvent` itself rather than by this app).

---

## Developers only

If you're working on this app rather than installing the published version:

```bash
cd packages/twenty-apps/internal/twenty-fireflies

# Day-to-day development (publish + install + watch in one):
yarn twenty dev

# Run unit tests:
yarn test

# Lint:
yarn lint
```

`twenty dev` is recommended for iteration — it publishes to your local Twenty
server, installs the app, and watches for changes in one command.

The Fireflies GraphQL API is called directly via `fetch` — no `fireflies` SDK
dependency. See `src/logic-functions/utils/fireflies-api-request.ts` for the
auth + error-handling wrapper that all queries go through.
