# Application client generation

The CLI calls `replaceCoreClient` from the app's installed
`twenty-client-sdk/generate`. See the [app tooling overview](../README.md) for
package boundaries. The package manifest is read through `readJsonObject`;
missing or malformed JSON and incorrect package names produce an expected-package
`CLIENT_GENERATION_FAILED` error.

Public `app apply` invokes the generator through the internal
`generateSourceClient` worker request.

## Package and output ownership

The app must have `node_modules/twenty-client-sdk/package.json` with the expected
package name. Resolution does not search workspace ancestors, avoiding writes
to a hoisted-only installation shared by other apps. Package-manager symlinks
are followed, so a linked installation can still be shared.

Resolve `twenty-client-sdk/generate` from this package and require the entry to
belong to the same real package directory. It must export a callable
`replaceCoreClient`. This keeps the generator and the client it writes into on
the same installed version, with no fallback to the CLI's own client SDK.

The output layout is `dist/core/generated`, `dist/core.mjs` and
`dist/core.cjs` inside that installation. Source files and the metadata client
remain unchanged. Neither apps nor SDK packages depend on the CLI. The client
SDK's generator dependencies remain part of the app's installed client package.

## Failure and cancellation

The worker requires a non-empty schema and an absolute app path. Failures use
`CLIENT_GENERATION_FAILED` / `CANCELLED` results. Missing or incompatible local
packages fail before invoking the generator. The generator rejects
invalid schemas without replacing the installed bundles.

Generation is not transactional. A generator failure can leave partial changes;
the wrapper reports that failure even if cancellation was requested meanwhile.
The generator has no cancellation parameter, so the wrapper waits for it to
settle and then checks the signal. Forced worker termination can interrupt file
writes. The operation does not roll back partial writes.

## Verification

From `packages/twenty-cli`, after building the shared, SDK and client SDK:

```sh
node ../../node_modules/vitest/vitest.mjs run --config vitest.config.ts src/app/client src/commands/app/__tests__/app-real-sdk.spec.ts --maxWorkers=1
```

Parity runs the SDK reference and the production CLI worker against
the same schema and app path, comparing every generated source file and both
compiled bundles byte for byte. Reusing the path keeps esbuild's source-path
comments identical without normalizing file contents. The app has its own client
SDK and no application SDK. The generated CommonJS client is loaded to verify
its `CoreApiClient` export.

Other cases cover a missing or hoisted-only package, invalid manifests and
schemas, missing exports, a non-callable API, selection of the app's generator,
pre-cancellation, in-flight cancellation and preserved failures/partial writes.
The local HTTP apply contract exercises CLI client
generation, along with snapshot upload, synchronization, pull-base recording
and release. No live workspace is contacted.
