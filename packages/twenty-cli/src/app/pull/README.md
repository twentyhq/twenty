# CLI application pull

Pull reconciles the server's application export with local definitions and a
target-bound baseline. It preserves unsupported and local-only entities, reports
overwritten local edits, and commits source changes and the new baseline as one
transaction. Source generation and translation behavior are covered by parity
and reconciliation tests.

See the [app tooling overview](../README.md) for package boundaries.

## Contract

- Source scanning stays inside the disposable CLI worker so configs containing functions are never serialized through IPC. Only the server export and report cross that boundary. Selected credentials are removed from the worker environment. App source is trusted developer code, not sandboxed code.
- The wire/export and baseline boundary check identity and envelope fields, not every metadata collection. `toPullManifest` is the single explicit assertion into the typed writers, preserving their trust in the server schema. Missing/null object and field collections are consumed with `?? []`, like the other collections. Malformed entity contents can still make reconciliation fail before writing. We do not duplicate the server's schema.
- The baseline file is an envelope whose `manifest` member is an `ExportedManifest`. Reconciliation walks arrays generically without maintaining a second collection list. Unrecognized collections and non-array metadata survive; protected or unreconciled definitions retain their prior baseline entries.
- `preparePullEntities` resolves the source layout once for current and baseline entities. Planning, overwrite reporting and nested-definition protection consume these prepared entities. A definition can leave a parent only when another retained or written file contains it, or its remote deletion is confirmed.
- Fields already declared with `defineField` stay in their existing files, even when the server exports them inside an object. Object generation excludes those fields; baseline comparisons use the same source layout. Pull also removes duplicate inline copies left in object files, while retaining the standalone definitions.
- Before destination writes, `assertPullSdkExports` checks the actual imports emitted by the writer against the app's SDK. It checks export presence, not every config shape; run typecheck to validate the generated definitions against the installed SDK.
- Temporary files and the baseline live under `.twenty/cli`. Apply and pull share `createPullBaseWrite` as the serializer. The baseline is bound to the API URL, workspace UUID and application UUID. Pull stages it with mode 0600 and writes it after the source files.
- The baseline can carry `sourceFingerprints`, a SHA-256 per app-relative source and locale file. Apply captures them before building. Pull reports an overwritten local change when a file it rewrites or deletes no longer matches its fingerprint. Without a fingerprint it compares the file with the writer's rendering of the baseline, which is reliable only for source produced by that writer. Pull carries fingerprints forward, updating the files it writes and dropping the ones it deletes.
- Ordinary I/O failures restore originals. Cancellation is checked before committing the staged plan, not halfway through it. An acknowledged successful commit wins over cancellation. The parent can forcibly kill an unresponsive worker after its grace period, so an unacknowledged result has outcome `unknown`, never a claim that rollback succeeded. Failed rollback retains backups and reports their directory; failure to clean up after a completed commit has outcome `pulled`.
- Human reporting uses CLI terminal escaping, machine reporting contains the full coverage and path lists, and gaps warn without stopping successful writes. Unknown coverage status strings remain visible. Pull does not prompt for approval or require a clean Git checkout; remote changes overwrite conflicting local edits and are included in the report.

Translation string extraction uses the CLI's TypeScript parser. Traversal, static-string rules, whitespace normalization and deduplication are checked against the SDK reference by parity tests. It does not depend on ts-morph or load parser tooling for help and command discovery.

Pull accepts metadata exports with `files: []` and refuses nonempty source/dependency-file exports. It does not restore package files, generate the typed client or write logic-function/front-component source. Export responses have a 16 MiB cap. Pull does not modify the workspace.

Tests cover writers, planning and reconciliation. Command tests build the actual Vite worker, exercise an authoring-only SDK, local mock HTTP, credentials/output isolation, SDK export refusal and forced termination after the first destination write. The repository SDK tests cover canonical generated definitions, nested coverage, translation preservation, target mismatch, overwrite reporting and rollback.
