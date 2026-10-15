# Bundles and snapshots

The CLI owns application bundling and immutable snapshot lifecycle. The internal
`bundleSnapshot` worker request builds and holds or releases a snapshot under
`.twenty/cli/snapshots/build-*`. The [typechecker](../typecheck/README.md) uses the
app's own TypeScript compiler. Build, plan, apply and uninstall use this pipeline.
Worker requests are internal, not a public API or a way to bypass build checks.

See the [app tooling overview](../README.md) for package ownership.

## Contract

Logic functions use an ESM/CJS banner, external modules and define stubs.
Front components use JSX wrappers, remote-DOM transformation, optional
preact aliases, bundled CSS injection, static shared-dependency export discovery
and live-binding shims. Translation catalogs live in the manifest and are supplied
by the host at runtime, so catalog-only edits leave component checksums unchanged.
Dependency discovery does not execute package initialization code. CommonJS
named exports must be statically detectable; packages that compute export names
at runtime can be consumed through their default export.

The bundler collects source and dependency files, public and generated assets,
and the README, and updates the manifest's artifact checksums. Snapshot copies
dereference symlinks. Each upload artifact records its role, byte size and
SHA-256 hash. README and source maps are included in the snapshot but are not
upload artifacts. The content hash combines the sorted artifact paths, roles and
hashes with the exact manifest bytes.

Each build has its own directory and lease. Release removes only a snapshot held
by that worker. Failed and cooperatively cancelled builds remove their temporary
directory. Forced worker termination can leave a snapshot behind. Cleanup only
removes snapshots owned by the current build.

## Implementation

- Source loading, manifest generation, translations and filesystem helpers are
  shared with the other CLI app operations. The [dev session](../dev/README.md)
  observes the build's inputs and retains immutable copies for remote apply.
- The define stub reads `twenty-sdk/define` from the app's installed SDK. Factories
  become no-op validators, plain-data exports retain their values, and other
  exports use proxy stubs. Runtime constants match the SDK the app uses.
- `sharp` is optional and resolved from the app. It is not a CLI dependency.
  When unavailable, cover generation warns and the build continues. Vite embeds
  the backdrop PNG as a data URI so it works in the standalone package.
- `compileApplication` runs the CLI typecheck after bundling, using the compiler
  resolved from the app.
- Workers run from the selected app directory, so invoking the CLI from a
  parent or nested directory produces the same bundle paths, bytes and hashes.
  SDK parity references run from the app root as well.
- Upload validation accepts only snapshots inside the selected app's
  `.twenty/cli/snapshots`, with path containment and per-file hash checks.
- The internal worker reuses the source SDK gate, credential filtering, output
  capture, cancellation and held-snapshot release flow, and stops esbuild after
  building. Public app commands share this worker lifecycle and its
  `ToolingResult` contract.

## Verification

After building shared, SDK and UI dependencies, from `packages/twenty-cli`:

```bash
node ../../node_modules/vitest/vitest.mjs run --config vitest.config.ts --maxWorkers=1 src/app/snapshots src/app/bundles src/app/__tests__/resolve-snapshot-directory.spec.ts src/commands/app/__tests__/app-real-sdk.spec.ts
```

The parity suite builds all five repository fixtures and a fresh CLI-created app
through the SDK reference and the production CLI worker. The app has a copy of
the real authoring SDK without its build/CLI exports or implementation files.
Successful builds preserve manifest configuration and artifact paths/roles.
Non-frontend files are compared byte for byte, except for `manifest.json` and
source maps. Frontend bundle bytes and checksums are allowed to differ: dedicated tests verify preserved
string literals, resolved CSS assets and live shared-dependency bindings. Every
CLI artifact's size/checksum and the snapshot content hash are checked against
the actual bytes. Tests also verify the manifest references for function, component
and shared-dependency bundles, and compare the serialized manifest with the
worker's manifest result. The invalid fixture fails in both
pipelines. The fresh CLI template's test setup typechecks with an authoring-only SDK.

Source-map comparisons for unchanged bundles resolve paths against each map's
directory and exclude the define stub's generator banner from `sourcesContent`.

Additional tests cover optional covers, project SDK constants, translation manifests,
translation-independent component checksums and CSS, README selection, immutable symlink copies, concurrent snapshots,
release ownership, failed/cancelled builds and failed snapshot consumers. The
build/apply contract runs CLI snapshots against a local HTTP fixture, including
uploads, sync, pull-base recording, release and client generation. It does not contact
a live Twenty workspace.

## Runtime translations

The host reads the active locale for an application installed in the current
workspace. Catalogs remain registration-wide, shared across installations and
application versions. Apply updates the catalog; mounted components receive the
new text through their execution context, without restarting the component.

Deploy the server and frontend support before distributing bundles built without
embedded catalogs. On an older host, new bundles render source messages. Older
bundles keep their own embedded catalogs, including when running on a newer host.
Use the updated SDK's `useTranslate` or `Trans` for reactive text; strings computed
once at module initialization do not recompute when a catalog changes.

Catalog reads are shared per client, workspace, application and locale. Events
received during a request schedule a subsequent read. Reconnects refresh active
catalogs. A slow initial read delays rendering by at most 500 ms; missing catalogs
and failed initial reads fall back to source messages. Failed refreshes retain the
last working catalog. Locale changes keep mounted components alive and update
text when the new catalog arrives.
