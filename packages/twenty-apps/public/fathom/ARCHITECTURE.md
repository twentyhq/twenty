# Fathom integration architecture

## Fireflies capability map

| Fireflies capability | Fathom implementation |
| --- | --- |
| Workspace API key | Per-user Twenty OAuth connection |
| Manually configured shared webhook | Webhook registered by the connection's on-connect hook |
| Separate transcript and summary webhook events | One signed meeting payload containing requested artifacts |
| Exact calendar ID / iCalUID matching | Conservative `meeting_url` plus scheduled-time matching |
| Deterministic CallRecording ID | SHA-256-derived UUID keyed by Fathom `recording_id` |
| Manual and initial backfill | Per-connection metadata discovery with paced artifact batches |
| Sync-call workflow tool | Supported by numeric Fathom `recording_id` |
| List calls by participant | Client-side exact invitee-email filtering over accessible calls |
| Keyword transcript search | Deferred; OAuth list responses cannot include transcripts |
| Daily workspace healer | Replaced by per-connection webhooks; cron cannot see user-private connections |

## Data flow

1. A Twenty user authorizes the centrally managed Fathom OAuth application.
2. Twenty stores and refreshes that user's access and rotating refresh tokens.
3. The on-connect hook creates a Fathom webhook containing the connection ID in
   its destination URL and stores the returned signing secret in app KV.
4. Fathom sends a signed meeting payload permitted by the connected account.
5. The app verifies the connection-specific signature, maps the payload to the
   standard CallRecording schema, and computes a deterministic record ID.
6. The app links the CallRecording only if normalized meeting URL and scheduled
   time identify one CalendarEvent unambiguously.
7. Repeated webhooks, manual syncs, and backfill converge on the same record.

## Backfill execution

Discovery processes one Fathom cursor page per worker job and enqueues another
worker with the returned cursor. This keeps each job bounded without imposing a
fixed history-page ceiling.

Artifact imports are split into five-meeting batches. A workspace KV schedule
reserves staggered batch slots per connected account, including across initial
and manual backfills. Fathom's SDK also backs off on HTTP 429 responses and the
job queue retries failed batches.

## Follow-up slices

1. Exercise OAuth, rotating refresh tokens, webhook registration, and webhook
   verification against a real development account.
2. Decide whether Fathom recordings should relate directly to matched People and
   Companies in addition to the existing CalendarEvent participant graph.
3. Add generic pre-disconnect cleanup support in Twenty Apps before deleting
   upstream subscriptions automatically.
4. Raise the shared OAuth token-endpoint quota before public rollout.
