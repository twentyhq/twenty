# Application typechecking

The CLI typechecks applications using their own TypeScript installation.
See the [app tooling overview](../README.md) for package ownership.

The internal `typecheckSource` worker request checks the app's source and compiler
configuration. `bundleSnapshot` runs this typecheck after bundling. A failed check
discards that build's snapshot. Public build, typecheck, plan, apply and uninstall
commands use this pipeline.

## Compiler ownership

The globally installed CLI resolves `typescript` from the app's `node_modules`
or a workspace ancestor. It never falls back to its own parser dependency,
`NODE_PATH` or Node's global package folders. Apps keep TypeScript in their
development dependencies; neither apps nor the SDK depend on the CLI.

Missing TypeScript returns `TYPESCRIPT_NOT_INSTALLED`. An incomplete installation,
missing compiler API or unsupported Plug'n'Play installation returns
`TOOLING_UNSUPPORTED`. The resolved compiler entry must belong to the app's
TypeScript installation so checks use the project's compiler version.

TypeScript is loaded only in the child worker. Its public JavaScript compiler API
is required. The CLI uses the installed compiler's diagnostic categories and
message formatter, so diagnostics follow the project's compiler version. The CLI
parser used for source loading remains independent.

## Compiler contract

- Read the app's `tsconfig.json`, preserve its project references and force
  `noEmit: true`. Do not write JavaScript, declarations or build information.
- Configuration read/parse errors fail the check, including missing configs,
  invalid options and missing extended configs. Source diagnostics use TS codes,
  project-relative paths and one-based line and column numbers.
- Unbuilt project references fail with TS6305, including diagnostics without a
  source location. Build the referenced projects separately; this check does not
  build them or silently ignore their errors.
- Build warnings remain alongside typecheck diagnostics. Failure never holds a
  snapshot for upload, and cleanup preserves unrelated snapshots.
- Check cancellation before and after the synchronous compiler work. A busy
  compiler cannot process IPC cancellation mid-call; the worker grace
  period and forced termination remain the fallback.

Different compiler versions can produce different diagnostics. Align compiler
versions when comparing CLI results with another tool. See the
[build requirements](../../../docs/commands.md#build-and-check-an-app) for
configuration and project-reference troubleshooting.

## Verification

From `packages/twenty-cli`, after building the shared and SDK dependencies:

```sh
node ../../node_modules/vitest/vitest.mjs run --config vitest.config.ts src/app/typecheck src/app/snapshots --maxWorkers=1
```

The typecheck suite compares the SDK reference, the CLI implementation
and the production worker with the same compiler. It also tests absent and hoisted
compilers, global-path fallback, incomplete installations and actual TypeScript
5.9.3 versus 5.7.3 behavior. The 5.7.3 compiler comes from the SDK's
ts-morph dependency for this test only.

Snapshot parity runs both real typecheck phases, with no compiler bypass.
The app fixture supplies only the SDK's authoring/runtime exports. The apply
contract exercises CLI snapshots against a local HTTP fixture.
For the fresh CLI template, parity compares successful builds with the test
setup included and Vitest configuration files excluded.
