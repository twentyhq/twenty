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

The desktop signs in with this integration's public OAuth registration using PKCE. Install Desktop Recorder before connecting the desktop; an OAuth-only registration is insufficient. The app's Settings tab provides the macOS download and configuration without a dedicated page in Twenty core.

## Recording processing and credits

The backend provisions audio-only Recall uploads, imports audio and transcripts into Twenty, and runs its own summarizer when `COMPANION_SUMMARY_ENABLED` is enabled. Summaries use Twenty AI. Recording charges use the existing `chargeCredits` API from `twenty-sdk/billing`, with the same duration-based rate as Call Recorder. Recall processing uses the configured Recall account.

A conditional status update ensures only the worker completing a recording submits its charge. Completed recordings are not charged again by webhook or recovery replays. As with the existing Call Recorder path, an ambiguous charge failure is not automatically retried. This integration adds no billing endpoint, pricing policy, receipt table, or usage-accounting migration.

Summary workers claim an application-scoped key atomically before running the paid agent. They cache the generated result before writing the recording summary, so delivery retries reuse that result. Persistent cache-write failures are reported after bounded retries; no additional queue is introduced. Maintenance saves cached automatic summaries without generating new ones or replacing an existing summary. Claims do not expire automatically: a worker interrupted during a paid request has an uncertain outcome and must not silently trigger another paid request. If a generated result cannot be persisted, it cannot be recovered automatically.

The prerequisites are native OAuth support for the installed integration and the `setAppKeyValueIfAbsent` mutation. Existing billing, queue, and usage services remain unchanged. Older servers without atomic claims cannot generate summaries safely and return an error rather than running an unlocked generation.

## Development

Use Node 24 and Yarn 4. Run `yarn install`, `yarn typecheck`, `yarn test:unit`, and `yarn lint` from this directory. Installation, Recall configuration, and migration instructions are in [SETUP.md](SETUP.md).

Integration tests use `yarn test` with explicit `TWENTY_API_URL` and `TWENTY_API_KEY` environment variables. They read an already installed application and never install, uninstall, or reset it.

No deployment credentials or provider keys belong in this package.
