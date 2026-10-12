# App source loading

This CLI-owned source loader powers `twenty app pull` and the [manifest builder](../manifest/README.md) used by public build, plan and apply commands.

Package boundaries are documented in the
[app tooling overview](../README.md).

## Boundary

`readAppIdentity` checks the installed SDK without importing it, then evaluates the application's definition in a disposable CLI worker. Source is trusted executable developer code. The child contains exits, captures bounded output and can be killed on cancellation; it is not a filesystem or network sandbox. Selected workspace credentials are removed from its environment by the worker launcher.

`scanProjectSourceFiles` stays inside the worker. Its configs may contain functions and React components, so reconciliation runs in that same worker rather than send configs over JSON IPC. Only the application UUID, display name and diagnostics cross the identity boundary.

## Compatibility

- The app supplies its own `twenty-sdk`, version `>=1.23.0`, with resolvable `twenty-sdk/define` and `twenty-sdk/front-component` entry points. The installed SDK's Node requirement is checked.
- There is no upper SDK version cap. Every evaluated definition must return the public `ValidationResult` shape: boolean `success`, object `config`, string-array `errors`, and optional string-array `warnings`. An incompatible shape fails with `SDK_SOURCE_UNSUPPORTED`. This validates the loader contract, not every future SDK behavior.
- The CLI owns esbuild, its TypeScript parser and tinyglobby as runtime dependencies. These load only for source operations. The app does not need to install TypeScript for source loading. Build and typecheck use the project's compiler separately.
- The pull writer separately checks the authoring exports its generated files use; this loader floor does not establish that every SDK since 1.23 supports all current manifest collections.

## Source contract

Source discovery covers root and nested `.ts`/`.tsx` files, excluding declarations, `node_modules`, `dist` and `.twenty`. Only a direct top-level `export default defineX(...)` is classified as a definition. Aliases, namespace calls and variable re-exports remain unsupported. Helpers reserve their paths without being evaluated on their own; imported helpers run as dependencies of a definition.

Definitions are bundled using the app's tsconfig and imports, then evaluated with a require rooted at the app. React resolves from the app. UI and generated-client imports use extraction stubs; these are not working UI or client implementations. CSS imports are ignored and conditional-availability expressions are transformed for extraction.

An ordinary extraction failure marks a scanned definition unreadable, retaining its path so reconciliation can avoid overwriting it. SDK validation errors leave the config available for reporting. Reading identity evaluates only application definitions, rejects duplicate or invalid application UUIDs, and returns `null` when no application is declared.

The loader checks SDK compatibility, validation-result shape and cancellation between files. Discovery is sorted: the loader, the identity reader and the scanner share `listApplicationSourceFiles`, so results do not depend on filesystem timing. Detection uses the function name rather than its import origin: a local helper named `defineObject`, for example, must be renamed if it returns an incompatible shape. Such a mismatch fails the scan. Source rewriting and reconciliation live in the adjacent `pull` module.

## Verification

Run the source-loader, SDK-resolution and worker tests with the CLI Vitest configuration. The repository-SDK fixture requires its existing SDK/UI/shared artifacts to be built, as do the other CLI app tests. Worker tests use an authoring-only SDK without a project compiler, exercise output and credential isolation, and cover source exits and cancellation.
