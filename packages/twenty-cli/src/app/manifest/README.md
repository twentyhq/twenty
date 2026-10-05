# Manifest generation

The manifest builder constructs and validates metadata and compiles translations
for build, plan and apply. The worker evaluates definitions through
[app/source](../source/README.md); bundling and final artifact checksums belong to
[app/bundles](../bundles/README.md).

See the [app tooling overview](../README.md) for package ownership.

## Contract

The builder discovers definitions and assets, derives default object fields and
permission identifiers, infers logic-function input schemas, resolves lifecycle
hooks, reads the README and validates entity relationships, identifiers, role
permissions and conditional availability. Manifests are sorted and carry
checksum placeholders that the bundler replaces with final artifact checksums.

`package.json`'s `engines.twenty` sets
`application.requiredServerVersionRange`, with surrounding whitespace trimmed;
an absent or empty value becomes `null`. No CLI version is substituted. The
builder reports package dependency warnings and validates empty lockfiles.

Translation compilation reuses the locale catalog helpers shared with
pull. It preserves the distinction between no locale directory (`undefined`)
and an empty one (`{}`), context-dependent message IDs, authored-over-compiled
precedence, orphan compiled translations, collision handling and skipped-file
warnings. It reads catalogs without rewriting them.

## Implementation

- Definition discovery, detection and evaluation reuse `app/source`, including
  its source and ignore globs and validation-result shape check.
- Source and public-asset discovery is sorted so warning, error and entity file
  order is deterministic.
- The loader result accepts a compile-time config type, with the same runtime
  shape check. Config types describe the authoring values consumed by the builder.
  Handler parameters use `never` and return `unknown`; front components expose
  only the `name` consumed here. The builder never calls those callbacks.
- The version helper requires an explicit app path; the process working directory
  cannot choose another app's version.
- Filesystem reads use Node and the CLI `pathExists` helper. The JSON reader
  propagates parse errors.
- The worker resolves the app's authoring SDK with the source compatibility check,
  returns structured errors and warnings, checks cancellation between phases and
  stops esbuild before exiting. It uses credential filtering,
  bounded output capture and cancellation/termination behavior. It does not hold
  a snapshot or write build state.

## Verification

From `packages/twenty-cli`, after building the repository SDK, shared and UI
packages:

```bash
node ../../node_modules/vitest/vitest.mjs run --config vitest.config.ts --maxWorkers=1 src/app/manifest/__tests__/manifest-parity.spec.ts
```

The suite bundles the SDK implementation as a test-only reference. It
compares manifests, entity file paths, errors and warnings for every repository
fixture and a freshly initialized app. It also exercises the production CLI
worker using a copy of the real SDK's authoring entry points without `./build`,
`./cli` or their implementation files.

The SDK reference's discovery is sorted to match the CLI's deterministic input
order. Comparisons remove only JSON-omitted `undefined` properties, matching the
worker IPC boundary; arrays and diagnostics are not reordered. The invalid-app
fixture throws `Invalid UUID` in both implementations. Additional cases cover
duplicate identifiers, empty lockfiles, translations, source output and credential filtering.
Unit tests cover individual validation and translation rules.
