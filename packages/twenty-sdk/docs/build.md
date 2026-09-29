# Programmatic application builds

`twenty-sdk/build` exposes local build, typecheck, client-generation and source-reconciliation operations for scripts, CI jobs, and integrations. It requires an app project and its installed dependencies, but no workspace connection or separate CLI package. The SDK does not manage credentials, read CLI configuration, contact a workspace, prompt, print results, or exit the process through this entry point. Application source is trusted executable code and can have its own side effects; callers that need process isolation should use a worker or child process.

Read `twenty-sdk/build/descriptor.json` before importing the SDK. It is generated from the package version and Node requirement at build time. Its protocol version is independent of SDK semver and server compatibility. Importing the build entry does not load TypeScript or esbuild.

```ts
import { buildAppSnapshot, releaseAppSnapshot } from 'twenty-sdk/build';

const result = await buildAppSnapshot({ appPath: process.cwd() });

if (!result.success) {
  console.error(result.diagnostics);
  throw new Error(result.error.message);
}

try {
  console.log(result.data.manifest);
  console.table(result.data.files);
} finally {
  const release = await releaseAppSnapshot({
    buildId: result.data.buildId,
  });

  if (!release.success) {
    throw new Error(release.error.message);
  }
}
```

Save the example as `build.mjs` in the app project and run it with Node. `typecheckApp({ appPath: process.cwd() })` checks the project without building artifacts. Public types, including `BuildSnapshot`, `BuildResult`, and `BuildDiagnostic`, are exported from `twenty-sdk/build`; consumers do not need the private `twenty-shared` package.

Protocol 1 advertises `build`, `typecheck`, `releaseSnapshot`, and `generateClient`. Older SDK releases may not offer every capability. Check the descriptor's capabilities rather than inferring them from the SDK version. Operations are loaded lazily, so importing the entry or reading `BUILD_DESCRIPTOR` does not load TypeScript or esbuild.

The import path and named exports `buildAppSnapshot`, `typecheckApp`, `releaseAppSnapshot`, `generateAppClient`, and `BUILD_DESCRIPTOR` are public SDK API for local application tooling. A protocol version bump does not make renaming those exports backward-compatible; changes must preserve existing imports or follow a breaking SDK release. Workspace authentication, uploads, and synchronization remain outside this entry point.

## Results and diagnostics

Operations return `{ success: true, data, diagnostics }` or `{ success: false, error: { code, message }, diagnostics }`. Typechecking succeeds with `data: null` and emits no files. Missing or invalid TypeScript configuration is a failure, including diagnostics without a source location.

Diagnostics have `severity`, `code`, and `message`, with optional project-relative `file` and one-based `line` and `column`. Codes include TypeScript codes such as `TS2322`. Operation error codes are `INVALID_APP_PATH`, `MANIFEST_BUILD_FAILED`, `BUILD_FAILED`, `TYPECHECK_FAILED`, `CLIENT_GENERATION_FAILED`, `IDENTITY_READ_FAILED`, `PULL_FAILED`, `BASE_RECORD_FAILED`, `CANCELLED`, `SNAPSHOT_NOT_FOUND`, and `SNAPSHOT_RELEASE_FAILED`. Callers decide how to display results and which exit codes to use.

Build and typecheck fail on TypeScript configuration and project-reference errors, including errors without a source location. The legacy builder's text parser silently ignored some of these failures; successful legacy builds do not establish that a project passes typechecking. Before migrating, run the new typecheck operation and fix its diagnostics. For `TS6305`, build the referenced TypeScript projects first, or correct references that should not be part of the app compilation. Regenerate any app-specific client types against the intended workspace and SDK. The SDK never builds referenced projects or emits declarations implicitly, so its declared file writes remain accurate.

Build and typecheck accept an optional `AbortSignal`. Cancellation is checked between asynchronous stages; synchronous TypeScript checking cannot be interrupted in-process. Use a worker or child process when immediate cancellation or protection against app code calling `process.exit` is required. This is process isolation, not a sandbox for untrusted code.

## Build snapshots

A successful build returns:

- `buildId`, unique for the build, and `directory`, an absolute directory containing stable artifact bytes.
- `manifestFormat: "twenty-application"` and the opaque `manifest`. This format name identifies the existing server manifest, which has no standalone numeric schema version. The server still validates compatibility.
- `application: { universalIdentifier, name, displayName }`, with `name` taken from the app package.
- `files`, the complete uploadable artifact set, sorted by path. Each entry has a snapshot-relative POSIX `path`, logical app-relative `sourcePath`, `role`, byte `size`, and `sha256`. Read artifact bytes from `directory` and `path`.
- `contentHash`, SHA-256 of the UTF-8 JSON encoding of the sorted `{ path, role, sha256 }` entries, a newline, then the exact `manifest.json` bytes. Compare within a compatible SDK/build environment; this is not a server-approved plan digest.

Roles are the server's upload folder values: `built-logic-function`, `built-front-component`, `source`, `dependencies`, and `public-asset`. Sources, dependency files, and generated assets are included every time, even when unchanged. Source maps, README, and `manifest.json` may also exist in the directory; they are not extra upload targets. Existing manifest checksum algorithms remain unchanged; artifact SHA-256 is a separate transport integrity contract.

`sourcePath` identifies an artifact's origin: compiled files point to their TypeScript source, the shared dependencies bundle points to `package.json`, and generated assets such as the cover may not exist in the app directory. It is not a path to the artifact's bytes.

Each build allocates a new `.twenty/snapshots/build-*/` directory inside the existing app directory, with artifacts in `files/` and owner information in `lease.json`. Cleanup removes only that new per-build directory, never the app directory, pre-existing snapshots, or `.twenty/output`. Static files are copied as bytes without modifying source symlinks or their targets, so changing a symlink target cannot mutate a retained snapshot.

Keep the owning SDK instance alive while consuming a snapshot. `releaseSnapshot` deletes the entire directory and its lease, not just the in-memory handle. Release in a `finally` block after consuming or uploading the artifacts. Unknown or foreign build IDs fail without deleting files. Never release a snapshot while another operation still uses its files.

Failed builds clean up their own directory. A killed process can leave an orphan. Protocol 1 does not automatically prune other processes' directories. To remove crash leftovers manually, stop all SDK build processes using that app first, then remove its `.twenty/snapshots` directory. This keeps active snapshots safe from PID reuse and cleanup races.

## Client generation

`generateAppClient({ appPath, schema, signal? })` generates the core API client from a supplied GraphQL schema string. The caller fetches the application schema using its own workspace connection. The SDK reuses the existing client generator without network requests and returns `BuildResult<null>`. It does not register, install, or synchronize an application, modify app source, or write pull-base state.

```ts
import { readFile } from 'node:fs/promises';
import { generateAppClient } from 'twenty-sdk/build';

const result = await generateAppClient({
  appPath: process.cwd(),
  schema: await readFile('./application-schema.graphql', 'utf8'),
});

if (!result.success) {
  throw new Error(result.error.message);
}
```

`appPath` must be an absolute path to an existing directory with `node_modules/twenty-client-sdk` installed. The operation validates the package manifest before writing, with no fallback to a parent or global installation. Dependency symlinks are followed, so a linked package's target is modified. Avoid parallel generation for apps sharing the same installed client package.

The descriptor lists writes under `node_modules/twenty-client-sdk/dist`: `core/generated/**`, the temporary `core/generated.tmp/**` directory, `core.mjs`, and `core.cjs`. Metadata clients and other package files are preserved. Client replacement is not atomic: generation or filesystem failures can leave partially updated local files. Fix the cause and rerun generation against the intended schema; failure does not roll back a prior remote sync.

Cancellation is checked before generation starts and after the generator settles. An already-aborted signal causes no writes. In-flight generation cannot be interrupted cooperatively; the operation waits for its writes to stop before returning `CANCELLED`. An independent generation failure remains `CLIENT_GENERATION_FAILED` even if the signal was aborted while generation was running. Completed or partial local writes can remain, including if the caller forcibly terminates a worker. Callers should report the remote sync and local generation outcomes separately.

## Existing SDK commands

The existing `twenty` binary and `twenty-sdk/cli` exports remain available. This API adds no executable, changes no command names, and requires no command migration.

Existing builds retain their output directory, symlink-copy behavior, typecheck implementation and error formatting. Snapshot isolation and the stricter configuration checks above apply to the new build operations.

## Pulling application source

Protocol 1 also offers `readIdentity`, `pull`, and `recordBase`. The corresponding lazy exports are `readAppIdentity`, `pullApp`, and `recordAppBase`.

`readAppIdentity({ appPath, signal? })` returns `BuildResult<{ application: { universalIdentifier, displayName } | null }>`. It finds and evaluates only the application declaration, without building other definitions or typechecking the project. An absent declaration returns `null`; unreadable or multiple declarations fail with `IDENTITY_READ_FAILED`. Project code remains trusted executable code.

`pullApp({ appPath, applicationExport, target, signal? })` reconciles a caller-supplied `exportApplication` payload with a local project. `target` contains the API URL and workspace UUID used to fetch that export. The caller owns authentication, fetching the export, and verifying the workspace. The SDK validates the payload and target, checks the local application identity, then reuses the source and translation planners. A project `package.json` is required. A different local application, unreadable identity, malformed export or unsupported export files causes `PULL_FAILED` before source writes.

The current server exports metadata with an empty `files` array. Non-empty source or dependency file exports are refused before any writes, rather than applying only part of the export. Dependency restoration and compatibility reporting need a future extension; this operation never installs dependencies or rewrites package pins.

The result includes the application identity, `base.status`, writes (paths and entity identities, without source contents), deletions, `overwrittenLocalChanges`, unchanged count, local-only and unreadable paths, skipped entities, translation counts, and entity labels. The caller retains the export's coverage report. A remote change wins over local edits; each overwritten local file is reported when it differs from the previous base's generated rendering. This is a conservative byte comparison, so formatting or comments can be reported as local edits. Local changes to remotely unchanged definitions remain intact.

The v2 base at `.twenty/pull-base.json` is bound to the normalized API URL, workspace UUID and application UUID. `base.status` is `used`, `missing`, `other-target`, `unbound` for legacy v1, or `unreadable`. An unusable base disables inferred deletions and preserves local-only entities. A base-owned definition is deleted only when absent from both the manifest and all coverage entries; unsupported and skipped entities remain on disk. A replacement that would erase a nested local definition without a confirmed remote deletion is skipped as a whole file and reported, so partial object or view exports cannot erase their unsupported children. Legacy SDK commands retain their v1 behavior and treat v2 bases as unavailable, just as these operations treat v1 bases as unavailable.

Source files and locale catalogs are staged and backed up under `.twenty/pull-staging-*/` and `.twenty/pull-backup-*/`. The descriptor's source globs are `**/*.ts` and `**/*.tsx`; scanning excludes declaration files and the `node_modules`, `dist` and `.twenty` directories. The base is committed last, after every source write and deletion succeeds. A write or base-commit failure rolls back the complete operation. If rollback itself fails, the error identifies the retained backup directory. Destination symlinks, including symlinked parent directories, are refused; read-only linked helpers are allowed. Run only one pull or base-record operation per checkout and do not edit its files concurrently.

`recordAppBase` accepts the same options and returns `BuildResult<null>`. It writes only the target-bound base using a fresh export, typically after the caller receives a successful apply acknowledgement. Failures use `BASE_RECORD_FAILED`; they do not undo an already completed remote apply. Build, typecheck and planning never advance this base.

Both mutating operations check cancellation before committing. Once source writes start, they complete or roll back before returning. A successful commit returns success and its result even if cancellation arrived during the commit, so callers can report what actually changed. An independent filesystem failure remains a failure even if cancellation happens concurrently. Callers must wait for these operations to settle rather than force-kill their workers on cancellation. Abrupt termination, machine failure and concurrent external edits are outside the rollback guarantee.
