# Granola for Twenty: implementation plan

Sync Granola meeting notes, transcripts and summaries into Twenty Call Recordings. One workspace API key pasted once; the app registers its own signed webhook, imports history, and exposes workflow and AI actions. Fireflies-style credentials on top of Fathom's proven sync pipeline, shipped as six sequential pull requests.

| | |
|---|---|
| Auth | API key. Granola has no OAuth for its REST API. |
| Plan required | Granola Business or Enterprise |
| Push | Standard Webhooks |
| Writes to | `CallRecording` (standard object, no new schema) |
| Stack | 6 PRs, each opened against `main` after the previous one merges |
| Reference apps | `packages/twenty-apps/public/fathom` (pipeline), `packages/twenty-apps/public/fireflies` (credentials) |

Sources: [Granola OpenAPI](https://docs.granola.ai/api-reference/openapi.json), [Granola webhooks](https://docs.granola.ai/webhooks), [Granola API keys](https://docs.granola.ai/help-center/sharing/integrations/granola-api), twentyhq/twenty at `main` on 2026-09-05.

---

## 1. Settled decisions

| Decision | Choice | Why |
|---|---|---|
| Credential model | One workspace-level application variable `GRANOLA_API_KEY`, pasted by a Twenty admin in Settings → Applications → Granola. Recommended key: a Granola **workspace API key** (admin-created, never expires, scope `workspace`). A personal key also works (scopes `personal` + `public`) but ties the integration to one person and expires when they leave. | Granola's REST API has no OAuth, and Twenty's connection providers only support `type: 'oauth'`. This is the Fireflies pattern. |
| Webhook registration | Programmatic. The app calls `POST /v1/webhook-endpoints`, stores the once-only `signing_secret` in app KV, and owns the endpoint's lifecycle (list, patch, delete). Nobody copies a secret by hand. | Removes the second paste Fireflies needs and matches Fathom's register-and-store flow. |
| Delivery routing | Fathom's server-route resolver. URL registered at Granola: `<SERVER_URL>/webhooks/server/<resolver uuid>?registrationId=<uuid>`. A server-scoped KV claim maps `registrationId` to the workspace. | No per-workspace public domain needed (Fireflies resolves by Host header, which fails on shared cloud domains). The endpoint id is unknown before creation, so the app mints its own `registrationId`. |
| Events subscribed | All three: `note.generated`, `note.access_granted`, `note.edited`. All converge on one sync function. | Generated plus access_granted is how a key discovers notes; edited carries summary changes. The upsert is idempotent so convergence is safe. |
| Record identity | CallRecording id = SHA-256 of `granola:<note_id>` shaped as a UUID v4, same helper shape as Fathom. `externalRecordingId` = the `not_` id. | Webhook, backfill, catch-up and manual sync converge on one record without a lookup table. |
| Calendar matching | Primary: `calendar_event.calendar_event_id` against `calendarChannelEventAssociation.eventExternalId` (Fireflies strategy 1). Secondary: exact `scheduled_start_time` match plus at least one invitee email overlap, only when exactly one candidate. Otherwise unlinked. | Granola exposes no meeting URL and no iCalUID, so Fathom's URL matcher and Fireflies' iCalUID fallback do not apply. |
| Private notes | Never imported. `private_notes_*` is ignored even when non-null. | It is the key owner's personal scratchpad; a shared CRM record is the wrong destination. |
| History | 31-day import on first successful registration; manual `POST /granola/backfill { days }` up to 3650; daily cron catch-up on `updated_after`. | Fathom's numbers and pacing. The cron also heals an endpoint Granola auto-disabled after four days of failures. |
| Actions | Sync Granola Note, List Granola Notes (by folder and date), List Granola Folders. No "by participant". | The list endpoint returns no attendees, so participant filtering costs one fetch per note at 5 requests per second. |
| Folder scoping | Optional, its own PR: settings picker writes `folder_ids` on the endpoint and the backfill honors the same filter. | Granola's one real granularity advantage over Fathom; worth shipping, but not on the critical path. |

---

## 2. Granola facts the implementation depends on

Read from the official OpenAPI 3.1 spec (title "Granola API", version 1.0.0) and the webhooks page on 2026-09-04. No sandbox environment and no official SDK exist; the app ships a thin typed fetch client.

### Access

| | |
|---|---|
| Base URL | `https://public-api.granola.ai`, all paths under `/v1` |
| Auth header | `Authorization: Bearer grn_…`. OpenAPI security scheme is bearer with `bearerFormat: apiKey`. No OAuth for REST. |
| Who can create keys | "Any workspace member on a Business or Enterprise plan." Personal keys: Settings → Connectors → API keys. Workspace keys: admins only, Settings → Connectors → Workspace API keys. |
| Key reach | Personal key: notes you own, notes shared with you, notes in private folders shared with you (`personal`), plus workspace-visible notes (`public`). Workspace key: public workspace notes plus spaces with "Allow Granola API access" on (`workspace`). Enterprise admins can disable a scope for non-admins; requests then return 403. |
| Rate limits | Burst 25 requests per 5 seconds, sustained 5 requests per second, per key. Excess returns 429. |
| Sign-up / partner program | None. No developer portal, no app registration, nothing to apply for. The only OAuth server Granola runs (`mcp-auth.granola.ai`) issues tokens for the MCP resource, not the REST API. |

### Endpoints

| Operation | Parameters | Returns |
|---|---|---|
| `GET /v1/notes` | `created_after`, `created_before`, `updated_after` (date or date-time), `folder_id` (includes subfolders), `cursor`, `page_size` 1–30 (default 10) | `{ notes: NoteSummary[], hasMore, cursor }`. NoteSummary: `id`, `title` (nullable), `owner { name, email }`, `created_at`, `updated_at`. No attendees, no calendar event. |
| `GET /v1/notes/{id}` | `include=transcript` | Full Note (below). 404 unknown. 413 `TRANSCRIPT_TOO_LARGE` when the transcript cannot be inlined. |
| `GET /v1/notes/{id}/transcript` | `cursor`, `page_size` 1–100 (default 50) | `{ transcript: TranscriptItem[], hasMore, cursor }`. Always works, including after a 413. |
| `GET /v1/folders` | `cursor`, `page_size` 1–30 | `{ folders: { id, name, parent_folder_id }[], hasMore, cursor }` |
| `POST /v1/webhook-endpoints` | Body: `url` (public HTTPS), `scopes` (required; exactly `["workspace"]` for a workspace key, else any of `personal`, `public`), `events` (default all three), `folder_ids` (1–100, subfolders included) | 201 WebhookEndpoint plus `signing_secret` (`whsec_…`, shown once). 400 bad request, 403 scope disabled by admin, 404 "webhooks API is not available for this workspace" (non-Business plan). |
| `GET /v1/webhook-endpoints` | none | `{ webhook_endpoints: WebhookEndpoint[] }`. No single-endpoint GET; find by id in the list. |
| `PATCH /v1/webhook-endpoints/{id}` | `url`, `scopes`, `events`, `folder_ids` (empty array removes the filter), `enabled` (pause or resume; secret kept; events while paused are dropped) | 200 WebhookEndpoint. 403 when the caller is not the creator (non-creators may only toggle `enabled`) or the endpoint is workspace-managed and a scope change is attempted. |
| `DELETE /v1/webhook-endpoints/{id}` | none | `{ id, object, deleted: true }`. 404 when gone. |

### Objects

| Object | Fields (all required in the schema; nullability noted) |
|---|---|
| Note | `id` (`not_` + 14 chars), `title` (nullable), `owner { name?, email }`, `created_at`, `updated_at`, `web_url`, `calendar_event` (nullable: `event_title`, `invitees[{ email }]`, `organiser`, `calendar_event_id`, `scheduled_start_time`, `scheduled_end_time`, each nullable), `attendees[{ name?, email }]`, `folder_membership[]`, `summary_text`, `summary_markdown` (nullable), `private_notes_text` and `private_notes_markdown` (null unless the key belongs to the note's owner), `transcript` (nullable array) |
| TranscriptItem | `speaker { source: microphone \| speaker, attribution?: me \| them, diarization_label?, name? }`, `text`, `start_time`, `end_time` (absolute date-times). `name` only when a speaker was identified; iOS transcripts carry only `diarization_label`. |
| WebhookEndpoint | `id` (`whe_` + 14 chars), `url`, `url_redacted` (true when the caller is not the creator), `events[]`, `folder_ids[]`, `scopes[]`, `enabled`, `created_by { name, email }`, `created_at` |
| Folder | `id` (`fol_` + 14 chars), `name`, `parent_folder_id` (nullable) |

### Webhook deliveries

| | |
|---|---|
| Events | `note.generated` (first AI summary), `note.edited` (summary edited or regenerated; `data.changed_fields`, currently always `["summary"]`), `note.access_granted` (shared with you directly or via a folder) |
| Payload | `{ event_id, event_type, note_id, occurred_at }` plus `data` on edited. Nothing else: every delivery needs a follow-up Get Note. |
| Signature | Standard Webhooks. Headers `webhook-id`, `webhook-timestamp` (unix seconds), `webhook-signature` = `v1,` + base64 HMAC-SHA256 over `{id}.{timestamp}.{raw body}`. Key = base64-decoded secret after the `whsec_` prefix. Retries reuse `event_id`. |
| Delivery contract | HTTPS only. 15 seconds to respond 2xx. 408, 429, 5xx and timeouts retry with exponential backoff for four days; 3xx and other 4xx are permanent. After four days of failures Granola disables the endpoint; there is no replay. |
| Plan | Business and Enterprise only. |

### What Granola does not expose

- No structured action items (they live inside `summary_markdown`), no meeting or conference URL, no recording audio or video, no recording start and end times.
- No iCalUID. `calendar_event_id` is the provider event id (Google-style, e.g. `…_20260127T153000Z`).
- No delete or unshare events. No write endpoints.
- No documented `Retry-After` on 429.

---

## 3. Twenty engine facts the app relies on

Verified in the repo at `main` on 2026-09-05.

| | |
|---|---|
| Connection providers | `defineConnectionProvider` accepts only `type: 'oauth'` (`packages/twenty-sdk/src/sdk/define/connection-providers/define-connection-provider.ts`). No per-user API-key connections, so no `getConnection`, no connect and disconnect hooks. Fathom's per-connection flow does not transfer. |
| Application variables | Declared in `defineApplication({ applicationVariables })` with `isSecret`; read in logic functions as `process.env.GRANOLA_API_KEY`; written from a settings front component through `MetadataApiClient.mutation({ updateOneApplicationVariable })`. Fireflies does exactly this. |
| Server routes | `serverRouteTriggerSettings` exposes `/webhooks/server/<logic function universalIdentifier>` at server level. The resolver returns `{ workspaceId, targetLogicFunctionUniversalIdentifier, payload }` and the delivery is queued to the target. `forwardedRequestHeaders` must list the three signature headers or they are dropped. |
| Authenticated routes | `httpRouteTriggerSettings` with `isAuthRequired: true`, callable from a front component via `RestApiClient.post('/s' + path)`. |
| KV | `kv.get / set / delete`, workspace scope by default, `{ scope: 'SERVER' }` for cross-workspace claims. No compare-and-set, no TTL. |
| Jobs | `enqueueJobs` takes one `delayMs` per call, so staggered batches are one call each. Only `RetryableLogicFunctionError` makes the platform retry. |
| Data access | `new CoreApiClient({ runAs: 'application' })` with the app's default role. Fathom's role: read `calendarEvent` and `calendarChannelEventAssociation`, read and update `callRecording`. |
| Environment | `TWENTY_API_URL` is available inside logic functions and is the base for the webhook destination URL. |
| CI | `discover-apps.yaml` auto-detects any folder under `packages/twenty-apps/public`. Per-app `.github` folders fail discovery. Jobs per app: lint, typecheck, unit; integration against a `local` server (installation and integration test) and against `dockerhub-latest` (integration only). |

---

## 4. Architecture

### Registration (once per workspace, admin action)

1. Admin pastes the key; the settings panel saves `GRANOLA_API_KEY` and calls `POST /s/granola/webhook-registration`.
2. The route loads the KV registration. If it is active and still listed at Granola, it returns it unchanged.
3. Otherwise it mints `registrationId`, writes the server-scoped claim `granola-registration:<registrationId>` = workspaceId, and creates the endpoint with `url = TWENTY_API_URL/webhooks/server/<resolver>?registrationId=…`, all three events, scopes resolved for the key type.
4. It stores `{ registrationId, webhookEndpointId, signingSecret, scopes, folderIds, isActive, isInitialBackfillEnqueued }` in workspace KV under one fixed key, deletes any stale previous endpoint it can reach, then enqueues the 31-day import once.
5. Transient Granola failures (429, 5xx, network) rethrow as `RetryableLogicFunctionError`; 403 and 404 surface as readable messages in the panel (scope disabled by admin, plan without webhooks).

### Live sync (per note event)

1. Granola posts to the resolver. Missing `registrationId` → 400; unknown claim → 404; known → payload queued to the workspace's webhook function, acknowledging within the 15-second window.
2. The webhook function verifies the Standard Webhooks signature against the stored secret using the raw body and a 5-minute timestamp tolerance, then parses `{ event_id, event_type, note_id }`.
3. It fetches `GET /v1/notes/{note_id}?include=transcript`; on 413 it pages `/transcript` at 100 items per page.
4. It maps the note to CallRecording fields, resolves the calendar event, and upserts by deterministic id. Retried deliveries hit the same id and are harmless.

### History and healing

1. `granola-backfill-worker` lists one page (`created_after`, `page_size` 30), drops notes whose CallRecording was deleted in Twenty, chunks the rest into batches of 5, reserves staggered slots (20 s apart) on a per-workspace schedule, enqueues one batch job per chunk, and continues with the cursor. Guards: stop on a repeated cursor; stop after 1000 pages with an error log.
2. `granola-backfill-batch` fetches and syncs each note sequentially. A transient error retries the batch; one unreadable note is logged and skipped.
3. `granola-daily-catch-up` (cron) lists `updated_after = now − 2 days` and syncs, covering missed `note.edited` deliveries. It also lists webhook endpoints and, if ours reports `enabled: false`, patches it back on and logs the outage.

### Rate budget

A batch of 5 notes costs 5 Get Note calls plus transcript pages for large notes, spaced 20 seconds apart, well under the 5 requests per second sustained limit. A webhook event costs one call. The daily catch-up lists in pages of 30. 429 responses map to `RetryableLogicFunctionError`.

---

## 5. Note to CallRecording mapping

| CallRecording field | Source | Rule |
|---|---|---|
| `id` | `id` | UUID derived from SHA-256 of `granola:<not_id>` with version and variant bits set. |
| `externalRecordingId` | `id` | Stored verbatim. |
| `title` | `title`, `calendar_event.event_title` | First non-empty; omitted when both are null. |
| `startedAt` / `endedAt` | `calendar_event.scheduled_start_time / scheduled_end_time`, transcript | Scheduled times when present; else first item `start_time` and last item `end_time`; else `created_at` for both. |
| `transcript` | `transcript[]` | One entry per item: `participant.name` = `speaker.name`, else owner name or email when `attribution` is `me`, else `diarization_label`, else "Participant". `words[0].text` = item text; `start_timestamp.relative` = seconds from `startedAt`. |
| `summary` | `summary_markdown`, `summary_text` | `{ markdown, blocknote: null }`. Markdown preferred, plain text as fallback. Private notes never included. |
| `status` | transcript | `COMPLETED` when at least one transcript entry, else `PROCESSING`. A later `note.edited` or the catch-up completes it. |
| `recordingRequestStatus` | constant | `REQUESTED`, as in Fathom. |
| `calendarEventId` | `calendar_event` | Association lookup by `eventExternalId`; fallback exact start time plus invitee overlap, only when unambiguous; otherwise omitted. |
| not stored | `web_url`, `attendees`, `folder_membership`, `owner` | Returned by the List Granola Notes action instead. No CallRecording field for them today. |

---

## 6. PR stack

Six PRs, each opened against `main` after the previous one merges, mirroring how the Fathom app shipped ([#24900](https://github.com/twentyhq/twenty/pull/24900), [#25197](https://github.com/twentyhq/twenty/pull/25197), [#25208](https://github.com/twentyhq/twenty/pull/25208), [#25251](https://github.com/twentyhq/twenty/pull/25251), [#25325](https://github.com/twentyhq/twenty/pull/25325), [#25327](https://github.com/twentyhq/twenty/pull/25327)). Branch names follow `<handle>/granola-<n>-<slug>`.

Local gate before every push:

```bash
yarn lint
yarn typecheck
yarn test:unit
yarn twenty dev:build
oxfmt --check src/
```

### PR 1: Scaffold Granola Twenty app

**Goal:** Land the generated app baseline, identity constants and default role so every later PR is behavior, not boilerplate.

Branch `granola-1-scaffold` · base `main` · ≈ 20 files · mirrors #24900

Adds, under `packages/twenty-apps/public/granola/`:

- `package.json` (`@twentyhq/granola` 0.1.0; deps `@sniptt/guards`; dev `twenty-sdk`, `twenty-client-sdk` at the version main's apps use, `oxlint`, `tsgo`, `vitest`)
- `.oxlintrc.json`, `.nvmrc`, `.yarnrc.yml`, `.gitignore`, `yarn.lock`
- `tsconfig.json`, `tsconfig.spec.json`, `vitest.config.ts`, `vitest.unit.config.ts`
- `AGENTS.md`, `CLAUDE.md` (copied from Fathom), `README.md`, `SETUP.md`, `CHANGELOG.md`
- `public/logo.svg`
- `src/application-config.ts`
- `src/default-role.ts`
- `src/constants/universal-identifiers.ts`
- `src/utils/is-defined.ts`, `src/utils/chunk-into-batches.util.ts`
- `src/__tests__/application-config.test.ts`, `schema.integration-test.ts`, `global-setup.ts`, `utils/logic-function-execution-context.util.ts`

Details:

- Generate with `create-twenty-app`, then delete the per-app `.github` folder; discovery rejects it.
- Every universalIdentifier is a fresh UUID v4 from `yarn twenty dev:add`. Reserve ids now for: application, role, resolver, webhook, registration route, connection status route, uninstall, backfill route, worker, batch, catch-up, three actions, settings component.
- Role identical to Fathom's: read `calendarEvent` and `calendarChannelEventAssociation`, read and update `callRecording`; not assignable to users, agents or API keys.
- README and SETUP describe the finished app, marked as in progress, so later PRs edit rather than rewrite.

Review focus:

- UUIDs valid v4; no `.github` folder; config and role match Fathom's shape field for field.
- CI matrix picks up `granola`, `granola (local)`, `granola (dockerhub-latest)`.

**Done when** the app installs on the local CI server, the schema integration test passes, and the three CI jobs are green.

### PR 2: Add the Granola API key and client

**Goal:** Let an admin paste one key, prove it works end to end, and give every later function a typed Granola client with the right error semantics.

Branch `granola-2-credentials` · base `main` after PR 1 · ≈ 25 files · replaces Fathom's OAuth PR #25197

Adds:

- `src/application-config.ts` (+ `applicationVariables.GRANOLA_API_KEY`, `isSecret: true`)
- `src/constants/granola.constant.ts` (base URL, page sizes, route paths, KV keys, event names, pacing numbers)
- `src/logic-functions/granola-connection-status.ts` (`GET /granola/connection-status`, auth required)
- `src/logic-functions/types/granola-note.type.ts`, `granola-note-summary.type.ts`, `granola-transcript-item.type.ts`, `granola-folder.type.ts`, `granola-webhook-endpoint.type.ts`
- `src/logic-functions/utils/get-granola-api-key.util.ts`
- `src/logic-functions/utils/create-granola-client.util.ts`
- `src/logic-functions/utils/is-transient-granola-error.util.ts`, `is-granola-not-found-error.util.ts`, `is-granola-transcript-too-large-error.util.ts`, `to-error-message.util.ts`
- `src/front-components/settings.front-component.tsx`
- `src/front-components/components/GranolaSettings.tsx`, `ApplicationVariableRow.tsx`, `ApplicationVariableLabelRow.tsx`, `StyledSettingsTextInput.tsx`
- `src/front-components/hooks/use-granola-application-variables.ts`, `use-update-application-variable.ts`, `use-granola-connection-status.ts`
- `src/front-components/utils/*` (`as-record`, `get-is-application-variable-configured`, `should-display-application-variable`, plus tests)
- `src/logic-functions/utils/__tests__/create-granola-client.test.ts`
- `src/__tests__/deployed-functions.integration-test.ts`

Details:

- Client methods: `listNotes`, `getNote`, `listTranscriptPage`, `listFolders`, `createWebhookEndpoint`, `listWebhookEndpoints`, `updateWebhookEndpoint`, `deleteWebhookEndpoint`. Types hand-written from the OpenAPI spec; no generated SDK dependency.
- Error classes carry status: 429, 5xx and network are transient; 404 is not found; 413 is transcript too large; 401 is an invalid key; 403 is scope disabled.
- Connection status route calls `GET /v1/folders?page_size=1` and returns `{ connected: true }` or a readable reason (key missing, key invalid, Granola unreachable).
- Settings panel, copied from Fireflies: one secret row for the key and a "Test connection" result line. Webhook and backfill sections arrive in PRs 3 and 4.

Review focus:

- The key never appears in logs or error messages.
- Fetch is wrapped once; every status mapping is unit-tested with a mocked `fetch`.
- Integration test executes the deployed status route with no key and gets the "not set" reason after the real bundle ran.

**Done when** pasting a real Business-plan key shows "Connected" in the panel, an invalid key shows "Key rejected by Granola", and all three CI jobs are green.

### PR 3: Sync Granola notes from webhooks

**Goal:** Register a signed webhook programmatically, route deliveries to the right workspace, and upsert each note as an idempotent Call Recording.

Branch `granola-3-live-sync` · base `main` after PR 2 · ≈ 45 files · mirrors #25208

Adds:

- `src/logic-functions/granola-register-webhook.ts` (`POST /granola/webhook-registration`, auth required)
- `src/logic-functions/granola-webhook-resolver.ts` (server route; forwards `webhook-id`, `webhook-timestamp`, `webhook-signature`)
- `src/logic-functions/granola-webhook.ts` (target: verify, fetch, sync)
- `src/logic-functions/granola-uninstall.ts`
- `src/logic-functions/types/granola-webhook-event.type.ts`, `granola-webhook-registration.type.ts`, `call-recording-sync-fields.type.ts`, `transcript-entry.type.ts`
- `src/logic-functions/utils/verify-standard-webhook-signature.util.ts`
- `src/logic-functions/utils/get-granola-webhook-destination-url.util.ts`, `get-granola-registration-claim-key.util.ts`, `get-granola-webhook-registration-key.util.ts`
- `src/logic-functions/utils/resolve-granola-webhook-scopes.util.ts`, `store-granola-webhook-registration.util.ts`, `delete-stale-granola-webhook-endpoint.util.ts`
- `src/logic-functions/utils/fetch-granola-note-with-transcript.util.ts`
- `src/logic-functions/utils/compute-call-recording-id-for-granola-note.util.ts`, `get-granola-note-title.util.ts`, `get-granola-note-time-range.util.ts`, `map-granola-transcript-to-entries.util.ts`, `format-granola-summary.util.ts`
- `src/logic-functions/utils/find-matching-calendar-event.util.ts`, `upsert-call-recording.util.ts`, `sync-granola-note-to-call-recording.util.ts`
- `src/front-components/components/GranolaWebhookSection.tsx`, `hooks/use-register-granola-webhook.ts`
- `src/logic-functions/utils/__tests__/*.test.ts` (signature vector from Granola's doc, scopes fallback, transcript mapping, summary formatting, calendar matching, id derivation, destination URL)
- `src/__tests__/utils/build-granola-note.util.ts`, `build-granola-transcript-item.util.ts`, `build-granola-server-error.util.ts`

Details:

- Registration is idempotent: an active registration whose endpoint id appears in `GET /v1/webhook-endpoints` is returned as is; a stale one is deleted (404 tolerated) before a new create.
- Scopes: try `["workspace"]`; if Granola rejects it for a personal key, retry with `["personal", "public"]`. Record the resolved scopes.
- The server claim is written before the create so a delivery can never arrive for an unclaimed id.
- Verifier accepts several space-separated `v1,` signatures, uses constant-time comparison, and rejects timestamps older than 5 minutes.
- Webhook function reads the raw body only; a parsed body would break the HMAC.
- Uninstall deletes the endpoint with the stored key, then the KV registration and the server claim; a failed delete is logged with the endpoint id since the KV goes away with the app.
- Settings section shows endpoint id, scopes, enabled state and offers "Register webhook" or "Re-register" (used after a key rotation).

Review focus:

- Order of writes in registration (claim, create, store, delete stale) and what each failure leaves behind.
- Signature verification against the documented sample; no path accepts an unsigned body.
- Upsert convergence when create races with a retried delivery.

Local QA:

- Behind a public tunnel: register, confirm the endpoint in Granola Settings → Connectors → Webhooks.
- Probes: no `registrationId` → 400; unknown → 404; known unsigned → queued then rejected by the target.
- Record a real meeting: Call Recording appears with title, transcript, summary; edit the summary in Granola and confirm `note.edited` updates it; uninstall removes the endpoint.

**Done when** a real Granola note lands as a Call Recording within seconds of generation, a second delivery of the same event changes nothing, and uninstall leaves no endpoint at Granola.

### PR 4: Add Granola history import, catch-up and actions

**Goal:** Import the last 31 days on registration, accept larger manual imports, heal missed events daily, and expose sync and list actions to workflows and AI.

Branch `granola-4-backfill` · base `main` after PR 3 · ≈ 40 files · mirrors #25251

Adds:

- `src/logic-functions/granola-backfill.ts` (`POST /granola/backfill { days: 1..3650 }`, auth required)
- `src/logic-functions/granola-backfill-worker.ts`, `granola-backfill-batch.ts`
- `src/logic-functions/granola-daily-catch-up.ts` (`cronTriggerSettings`)
- `src/logic-functions/granola-sync-note.ts` (tool + workflow action; input `noteId`)
- `src/logic-functions/granola-list-notes.ts` (tool + workflow action; `folderId?`, `createdAfter?`, `limit ≤ 30`)
- `src/logic-functions/granola-list-folders.ts` (tool)
- `src/logic-functions/types/granola-backfill-worker-payload.type.ts`, `granola-backfill-schedule.type.ts`, `granola-note-call-summary.type.ts`
- `src/logic-functions/utils/enqueue-granola-job-or-throw.util.ts`, `enqueue-granola-backfill-worker.util.ts`, `reserve-granola-backfill-batch-slots.util.ts`, `get-granola-backfill-schedule-key.util.ts`
- `src/logic-functions/utils/list-granola-note-page.util.ts`, `exclude-deleted-granola-notes.util.ts`, `list-deleted-call-recording-ids.util.ts`, `map-granola-note-to-call-summary.util.ts`, `heal-granola-webhook-endpoint.util.ts`
- `src/logic-functions/granola-register-webhook.ts` (edit: enqueue the 31-day import once)
- `src/front-components/components/GranolaBackfillSection.tsx`, `hooks/use-request-granola-backfill.ts`, `utils/parse-backfill-days.util.ts`
- `src/logic-functions/__tests__/granola-backfill-worker.test.ts`, `granola-sync-note.test.ts`, `granola-list-notes.test.ts`, utils tests for paging, slot reservation, deleted exclusion
- `src/__tests__/deployed-functions.integration-test.ts` (edit: backfill route and both actions)

Details:

- Worker payload `{ createdAfter, cursor, pageIndex }`; continuation stops on a repeated cursor and at 1000 pages with an error naming the pending cursor.
- Batch size 5, stagger 20 s, retry limit 3, per-workspace schedule in KV. Non-atomic read-modify-write accepted, as in Fathom, with the same comment.
- Import marker written after the enqueue, not before: a lost KV write duplicates a bounded idempotent import; the reverse would silently lose it.
- Notes whose Call Recording was soft-deleted in Twenty are skipped so a backfill never resurrects a record someone removed.
- Daily catch-up: `updated_after = now − 2 days`, and re-enable an endpoint reported `enabled: false`.
- Actions run with the workspace key; there is no per-user connection to resolve.
- List Granola Notes returns id, title, owner, created_at, updated_at and web_url per note; the action description tells the agent to pass the id to Sync Granola Note.

Review focus:

- Worker termination guards and pacing math.
- Workflow output schemas never declare a type the handler can violate (omit optional fields rather than emit null).
- Integration tests execute the deployed backfill route and actions without a key and reach the "not set" path after real input validation.

**Done when** a fresh registration imports the last 31 days paced at one batch per 20 s, a manual 365-day import completes without a 429 storm, and the AI chat can list and sync a note by id.

### PR 5: Scope Granola sync to chosen folders

**Goal:** Let the admin pick Granola folders so only those notes are pushed and imported.

Branch `granola-5-folders` · base `main` after PR 4 · ≈ 15 files · no Fathom equivalent

Adds:

- `src/logic-functions/granola-folders.ts` (`GET /granola/folders`, auth required; pages through all folders)
- `src/logic-functions/granola-update-webhook-folders.ts` (`POST /granola/webhook-registration/folders { folderIds }`; PATCH `folder_ids`; store)
- `src/logic-functions/granola-backfill-worker.ts` (edit: one discovery pass per folder when a filter is set)
- `src/front-components/components/GranolaFolderSection.tsx`, `hooks/use-granola-folders.ts`, `use-update-granola-folders.ts`
- tests for folder tree flattening, PATCH payload, filtered backfill fan-out

Details:

- Empty selection means unfiltered; the PATCH sends `[]` to clear.
- Up to 100 folder ids; subfolders are implied by Granola, so the picker shows the tree but sends parents only.
- A workspace key may only reference folders it can list; the route surfaces Granola's 400 as "folder not accessible to this key".

Review focus:

- Registration KV stays the single source of truth for `folderIds`; backfill and webhook read the same value.

**Done when** selecting one folder stops deliveries for notes outside it, and a backfill imports only that folder's notes.

### PR 6: Make the Granola app publishable

**Goal:** Finish listing copy, assets and changelog so the app can be published to the Twenty app store.

Branch `granola-6-publish` · base `main` after PR 5 · ≈ 8 files · mirrors #25325 and #25327

Adds or edits:

- `README.md` (What you get · Requirements · Heads up, in Fathom's voice)
- `SETUP.md` (Business plan, workspace key, tunnel, register, backfill curl)
- `CHANGELOG.md` (0.1.0 entries)
- `public/logo.svg`, `public/gallery/granola-cover-image-1.png`, `granola-cover-image-2.png`
- `src/application-config.ts` (description, websiteUrl, termsUrl, emailSupport, issueReportUrl, galleryImages)
- `src/constants/universal-identifiers.ts` (`APP_DESCRIPTION`)

Details:

- Requirements copy states plainly: Granola Business or Enterprise plan; an admin creates a workspace API key; personal notes are only reachable with a personal key.
- Heads up copy: re-register after rotating the key; Granola drops events while an endpoint is paused; deleted Granola notes are not removed from Twenty.

Review focus:

- Listing copy matches behavior shipped in PRs 3 to 5, no promises beyond it.

**Done when** the publishing checklist in docs.twenty.com/developers/extend/apps/operations/publishing passes and the listing renders with both gallery images.

---

## 7. How each PR gets reviewed

Observed on the Fathom stack. Nothing here is aspirational.

### Automated reviewers

- **greptile** posts P1/P2 findings inline and withdraws them when the author's rebuttal holds.
- **cubic** posts P1–P3 findings with a confidence score and a "Prompt for AI agents" block. It blocks auto-approval with "Requires human review" while findings stay unresolved, and marks findings "Addressed in `<sha>`" when a push fixes them.
- **twenty-ci-bot-public** posts quality nits tied to the house rules: `isDefined` over manual nullish checks, single-object arguments for multi-parameter utils, string literals over enums.
- **CodeQL** runs on every push.

### CI gates

- `granola`: lint, typecheck, unit tests.
- `granola (local)`: install on a locally built server, then integration tests.
- `granola (dockerhub-latest)`: integration tests against the published server image, which catches SDK and engine drift.
- `ci-twenty-apps-status-check` aggregates them.

### Author protocol

- Reply to every thread: either "Done in `<sha>`" or a reasoned rebuttal stating the invariant that makes the finding moot. Resolve the thread after.
- PR body sections, in order: **Summary** (bullets), **Validation** (commands run plus QA steps with observed results), **Stack** (n of 6, predecessor link), **Deferred** (what is knowingly left out and where it lands).
- Repeated bot findings on new pushes mean fix the root cause; bot findings are bug reports, never "design-level".
- Merge when the three CI jobs are green and no thread is open. The Fathom PRs were merged by their author.

### Lessons carried over from Fathom

- Fathom's PRs 2 to 4 were first opened stacked on each other (#24901, #24902, #24903) and could not be reopened after their base branches were deleted. They were recreated as #25197, #25208, #25251. Open each Granola PR against `main` once the previous one merges.
- Bots asked, and the answers were kept in code comments: import marker after enqueue, non-atomic schedule accepted, one enqueue call per staggered batch, page bound as a cycle guard. Reuse the same comments so the same questions close fast.

---

## 8. Verify with a live key before PR 3 merges

Documented nowhere; the design tolerates any answer, but the fallback code paths need to be exercised once against Granola. Needs a Business or Enterprise workspace with an admin who can create a workspace key, plus a public HTTPS tunnel.

| Question | Design that depends on it |
|---|---|
| What status and body does `POST /v1/webhook-endpoints` return when a personal key passes `scopes: ["workspace"]`? | The scopes fallback in `resolve-granola-webhook-scopes`. |
| Does `GET /v1/notes` ever return a note whose Get Note has an empty transcript? | `PROCESSING` status logic and whether the catch-up must revisit those notes. |
| Does `note.generated` fire before the transcript is complete? | Same as above. |
| Can `webhook-signature` carry several space-separated signatures during secret rotation? | The verifier already accepts a list; confirm the format. |
| After four days of failures, does the list report the endpoint as `enabled: false`? | The daily catch-up's heal step. |
| Does a 429 include `Retry-After`? | Whether the client can honor it or must rely on the platform's backoff. |

**Optional spike, not on the path.** Granola's REST 401 message says `Expected: Bearer <api_key|token>`. If an OAuth token from `mcp-auth.granola.ai` (Dynamic Client Registration, PKCE S256, refresh tokens) is accepted by the REST API, a per-user OAuth connection provider becomes possible with Twenty's existing engine. Fifteen minutes with a registered client answers it. Undocumented, so it changes nothing above until proven.

---

## 9. Deliberately out of v1

- **Per-user connections.** Requires an `api_key` connection provider type in twenty-sdk and the engine. Separate platform PR; would also benefit Fireflies.
- **List by participant.** Needs one Get Note per listed note; revisit if Granola adds attendees to the list endpoint.
- **Recording media.** Granola exposes none.
- **Deleting Twenty records when a Granola note is deleted or unshared.** No event exists.
- **Private notes.** Excluded by decision, not by limitation.
