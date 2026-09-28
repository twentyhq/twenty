# Programmatic build tooling

`twenty-sdk/tooling` exposes local build and typecheck operations for scripts, CI jobs, and integrations. It requires an app project and its installed dependencies, but no workspace connection or separate CLI package. The SDK does not manage credentials, read CLI configuration, contact a workspace, prompt, print results, or exit the process through this entry point. Application source is trusted executable code and can have its own side effects; callers that need process isolation should use a worker or child process.

Read `twenty-sdk/tooling/descriptor.json` before importing the SDK. It is generated from the package version and Node requirement at build time. Its protocol version is independent of SDK semver and server compatibility. Importing the tooling entry does not load TypeScript or esbuild.

```ts
import { tooling } from 'twenty-sdk/tooling';

const result = await tooling.build({ appPath: process.cwd() });

if (!result.success) {
  console.error(result.diagnostics);
  throw new Error(result.error.message);
}

try {
  console.log(result.data.manifest);
  console.table(result.data.files);
} finally {
  const release = await tooling.releaseSnapshot({
    buildId: result.data.buildId,
  });

  if (!release.success) {
    throw new Error(release.error.message);
  }
}
```

Save the example as `build.mjs` in the app project and run it with Node. `tooling.typecheck({ appPath: process.cwd() })` checks the project without building artifacts. Public types, including `ToolingApi`, `ToolingResult`, and `ToolingBuildSnapshot`, are exported from `twenty-sdk/tooling`; consumers do not need the private `twenty-shared` package.

Protocol 1 advertises `build`, `typecheck`, and `releaseSnapshot`. Check the descriptor's capabilities rather than inferring them from the SDK version. Operations are loaded lazily, so reading the descriptor does not load TypeScript or esbuild.

## Results and diagnostics

Operations return `{ success: true, data, diagnostics }` or `{ success: false, error: { code, message }, diagnostics }`. Typechecking succeeds with `data: null` and emits no files. Missing or invalid TypeScript configuration is a failure, including diagnostics without a source location.

Diagnostics have `severity`, `code`, and `message`, with optional project-relative `file` and one-based `line` and `column`. Codes include TypeScript codes such as `TS2322`. Operation error codes are `INVALID_APP_PATH`, `MANIFEST_BUILD_FAILED`, `BUILD_FAILED`, `TYPECHECK_FAILED`, `CANCELLED`, `SNAPSHOT_NOT_FOUND`, and `SNAPSHOT_RELEASE_FAILED`. Callers decide how to display results and which exit codes to use.

Both new operations fail on TypeScript configuration and project-reference errors, including errors without a source location. The legacy builder's text parser silently ignored some of these failures; successful legacy builds do not establish that a project passes typechecking. Before migrating, run the new typecheck operation and fix its diagnostics. For `TS6305`, build the referenced TypeScript projects first, or correct references that should not be part of the app compilation. Regenerate any app-specific client types against the intended workspace and SDK. The tooling never builds referenced projects or emits declarations implicitly, so its declared file writes remain accurate.

Build and typecheck accept an optional `AbortSignal`. Cancellation is checked between asynchronous stages; synchronous TypeScript checking cannot be interrupted in-process. Use a worker or child process when immediate cancellation or protection against app code calling `process.exit` is required. This is process isolation, not a sandbox for untrusted code.

## Build snapshots

A successful build returns:

- `buildId`, unique for the build, and `directory`, an absolute directory containing stable artifact bytes.
- `manifestFormat: "twenty-application"` and the opaque `manifest`. This format name identifies the existing server manifest, which has no standalone numeric schema version. The server still validates compatibility.
- `application: { universalIdentifier, name, displayName }`, with `name` taken from the app package.
- `files`, the complete uploadable artifact set, sorted by path. Each entry has a snapshot-relative POSIX `path`, app-relative `sourcePath`, `role`, byte `size`, and `sha256`.
- `contentHash`, SHA-256 of the UTF-8 JSON encoding of the sorted `{ path, role, sha256 }` entries, a newline, then the exact `manifest.json` bytes. Compare within a compatible SDK/tooling environment; this is not a server-approved plan digest.

Roles are the server's upload folder values: `built-logic-function`, `built-front-component`, `source`, `dependencies`, and `public-asset`. Sources, dependency files, and generated assets are included every time, even when unchanged. Source maps, README, and `manifest.json` may also exist in the directory; they are not extra upload targets. Existing manifest checksum algorithms remain unchanged; artifact SHA-256 is a separate transport integrity contract.

Each build writes only under a unique `.twenty/snapshots/build-*/` directory, with artifacts in `files/` and owner information in `lease.json`. It never clears another build's output or `.twenty/output`. Static files are copied as bytes, so changing a symlink target cannot mutate a retained snapshot.

Keep the owning tooling instance alive while consuming a snapshot. `releaseSnapshot` deletes the entire directory and its lease, not just the in-memory handle. Release in a `finally` block after consuming or uploading the artifacts. Unknown or foreign build IDs fail without deleting files. Never release a snapshot while another operation still uses its files.

Failed builds clean up their own directory. A killed process can leave an orphan. Protocol 1 does not automatically prune other processes' directories. To remove crash leftovers manually, stop all tooling processes using that app first, then remove its `.twenty/snapshots` directory. This keeps active snapshots safe from PID reuse and cleanup races.

## Existing SDK commands

The existing `twenty` binary and `twenty-sdk/cli` exports remain available. This API adds no executable, changes no command names, and requires no command migration.

Existing builds retain their output directory, symlink-copy behavior, typecheck implementation and error formatting. Snapshot isolation and the stricter configuration checks above apply to the new tooling operations.
