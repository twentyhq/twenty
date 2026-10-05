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
preact aliases, CSS injection, comment stripping, shared dependency export probes
and shims. The app's translation catalogs are embedded in the bundles.

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
Successful builds have identical manifests, artifact roles/paths/sizes/hashes
and content hashes. The invalid fixture fails in both pipelines. The fresh
CLI template's test setup also typechecks with an authoring-only SDK. The parity
fixture excludes Vitest configuration files to keep its build comparison focused
on application source, including the test setup.

Only build IDs/directories and JSON-omitted `undefined` properties are normalized
in snapshot comparisons. File bytes, including the manifest, are exact except
source maps: real paths are resolved against each map's directory, and the
define stub's generator banner comment is excluded from `sourcesContent`.
Virtual plugin source names, generated statements, mappings and all other map
contents are compared as-is.

Additional tests cover optional covers, project SDK constants, baked translations
and CSS, README selection, immutable symlink copies, concurrent snapshots,
release ownership, failed/cancelled builds and failed snapshot consumers. The
build/apply contract runs CLI snapshots against a local HTTP fixture, including
uploads, sync, pull-base recording, release and client generation. It does not contact
a live Twenty workspace.
