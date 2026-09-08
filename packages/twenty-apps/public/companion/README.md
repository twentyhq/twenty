# Desktop Recorder integration

The independent Twenty backend for the [Twenty desktop app](../../../twenty-companion/README.md). It provides personal calendars, audio upload provisioning, transcripts, summaries, and recording recovery. Call Recorder is not required.

## Responsibilities

```text
Twenty desktop → Twenty OAuth + /companion/desktop
                  → Recall Desktop SDK (temporary upload token)
Recall webhook → Desktop Recorder importer → standard CallRecording
                                   → Desktop Recorder summarizer → Twenty AI
Desktop Recorder maintenance → recover missed upload completion events
```

The integration has its own application registration, default role, custom fields, logic functions, summarizer agent, application settings, Recall credentials, and webhook endpoint. It shares Twenty's standard calendar, people, and Call Recording objects with the rest of the CRM.

Desktop requests run as the signed-in user. Processing jobs only accept recordings with a valid `companionSession`; webhook events additionally require Recall metadata `twentyRecordingSource: companion`. An installed calendar bot can coexist: Desktop Recorder checks standard scheduled/active recording state to avoid recording that event twice. It does not read Call Recorder's custom fields or invoke its functions.

The native OAuth public client handles browser sign-in separately from this backend application's registration. Installing the backend is required even if an OAuth client named Twenty already exists.

## Recording processing and credits

The backend provisions audio-only Recall uploads, imports audio and transcripts into Twenty, and runs its own summarizer when `COMPANION_SUMMARY_ENABLED` is enabled. Summaries use Twenty AI. Duration-based recording charges use the durable `/app/billing/charge-idempotent` endpoint. Recall processing still uses the configured Recall account.

A recording becomes `COMPLETED` with a separate `PENDING` billing state. The server stores a receipt before acknowledging a charge; maintenance retries delivery and ClickHouse deduplicates repeated receipt deliveries. Historical completed recordings without billing state are not retroactively charged. There is still no credit preflight before capture.

Summary workers claim an application-scoped key atomically before running the paid agent. They store the generated result before writing the recording summary, so delivery retries reuse that result. If PostgreSQL remains unavailable after short retries, the result is queued in Redis for independent persistence. The queue retries for 24 hours and retains exhausted jobs for operator replay; production requires durable Redis storage. Maintenance saves cached automatic summaries without generating new ones or replacing an existing summary. Claims do not expire automatically: a worker interrupted during a paid request has an uncertain outcome and must not silently trigger another paid request.

Deploy the matching server changes before this application: the atomic and queued key-value mutations, durable billing endpoint, PostgreSQL receipt migration, ClickHouse migration 008, and billing-delivery cron registration are required. Older servers reject these new operations; there is no fallback to non-idempotent billing or unlocked summary generation. The local development server has billing disabled, so successful unit/storage tests do not prove production credit deductions or exhausted-credit behavior.

## Development

Use Node 24 and Yarn 4. Run `yarn install`, `yarn typecheck`, `yarn test:unit`, and `yarn lint` from this directory. Installation, Recall configuration, and migration instructions are in [SETUP.md](SETUP.md).

Integration tests use `yarn test` with explicit `TWENTY_API_URL` and `TWENTY_API_KEY` environment variables. They read an already installed application and never install, uninstall, or reset it.

No deployment credentials or provider keys belong in this package.
