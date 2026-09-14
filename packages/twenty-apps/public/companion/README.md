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

The desktop uses the existing CLI OAuth client and PKCE flow from `twenty remote:add`. After sign-in it checks whether the Desktop Recorder backend is available and offers installation if needed. The app's Settings tab provides the macOS download and configuration without a dedicated page in Twenty core.

## Recording processing and credits

The backend provisions audio-only Recall uploads, imports audio and transcripts into Twenty, and runs its own summarizer when `COMPANION_SUMMARY_ENABLED` is enabled. Summaries use Twenty AI. Recording charges use the existing `chargeCredits` API from `twenty-sdk/billing`, with the same duration-based rate as Call Recorder. Recall processing uses the configured Recall account.

A conditional status update ensures only the worker completing a recording submits its charge. Completed recordings are not charged again by webhook or recovery replays. As with the existing Call Recorder path, an ambiguous charge failure is not automatically retried. This integration adds no billing endpoint, pricing policy, receipt table, or usage-accounting migration.

Transcript updates enqueue summary generation with a stable job ID per recording. The existing queue deduplicates jobs, and the existing KV store caches results before writing the recording summary so retries reuse them. A running marker preserves uncertain paid attempts after interruption. Maintenance saves cached summaries without generating new ones or replacing an existing summary. Persistent cache-write failures are reported after bounded retries.

The integration uses existing CLI OAuth, queue job IDs, and KV get/set operations. No changes to core billing, queue, or application-state APIs are required.

## Development

Use Node 24 and Yarn 4. Run `yarn install`, `yarn typecheck`, `yarn test:unit`, and `yarn lint` from this directory. Installation, Recall configuration, and migration instructions are in [SETUP.md](SETUP.md).

Integration tests use `yarn test` with explicit `TWENTY_API_URL` and `TWENTY_API_KEY` environment variables. They read an already installed application and never install, uninstall, or reset it.

No deployment credentials or provider keys belong in this package.
