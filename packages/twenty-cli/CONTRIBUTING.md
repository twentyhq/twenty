# Contributing to Twenty CLI

This package is the `twenty` executable in the Twenty monorepo. Its Nx project
is named `twenty-cli`; its Yarn workspace and npm package are named `twenty`.
Follow the repository's development instructions and nearby code conventions.

## Build and verify

Run these from the repository root after installing its dependencies:

```bash
yarn nx build twenty-cli
node packages/twenty-cli/dist/cli.cjs --help
yarn nx lint twenty-cli
yarn exec tsgo -p packages/twenty-cli/tsconfig.json --noEmit
```

Tests that use real applications or SDK parity references require the repository
SDK to be built. Its Nx target builds its dependencies:

```bash
yarn nx build twenty-sdk
cd packages/twenty-cli
yarn exec vitest run --maxWorkers=2
```

For a focused change, pass its test file or directory to `vitest run`. Command
tests execute the public command runner with local HTTP fixtures. Worker tests
exercise subprocess output, cancellation and snapshot lifetime. Parity suites
compare generated source and artifacts against the SDK implementation;
the SDK is a test reference, not a runtime tooling dependency.

Rebuild `twenty-shared` with `--skip-nx-cache` after switching branches or changing
shared exports. Generated `dist` directories are not tracked, and stale outputs
can invalidate dependent test and typecheck results. Use the direct TypeScript
command above when checking a fix rather than relying on an Nx cache hit.

No live workspace is required for the unit suite. Passing it does not establish
live authorization, remote upload or server-version compatibility. Exercise
changed server workflows against a disposable workspace when appropriate.

## Package map

| Location | Responsibility |
| --- | --- |
| `src/catalog` | Command definitions, topics and lazy handler loading |
| `src/commands` | Command orchestration and user-visible results |
| `src/program` | Argument parsing, target setup, interaction and command lifecycle |
| `src/config`, `src/target`, `src/oauth` | Saved connections, target selection and authentication |
| `src/transport` | HTTP/GraphQL requests, proxy routing, limits and cancellation |
| `src/metadata`, `src/data` | Workspace metadata inspection and record reads |
| `src/doctor` | Read-only setup and connection diagnostics |
| `src/app` | Project tooling and application lifecycle, see its [module map](src/app/README.md) |
| `src/input`, `src/output` | Input parsing, human/JSON/NDJSON output and error contracts |
| `app-template-overlay` | CLI-based test harness applied over the shared app template |

Command definitions are the source for help and `twenty commands`. Keep handlers
lazy so discovery does not load compiler or app code. Put a workflow's rules in
its owning module; a command handler should connect parsed input, that module
and output. Preserve meaningful behavior tests when moving implementation files.

## Application tooling guarantees

The [application module documentation](src/app/README.md) describes each stage.
Changes must preserve these contracts:

- App definitions execute as trusted code in a disposable worker. The worker
  contains process exits, filters CLI credentials and captures bounded output;
  it is not a filesystem or network sandbox. Executable configs stay in the
  worker, and only serializable requests and results cross IPC.
- A build's immutable snapshot stays alive until its consumers finish. Uploads
  verify containment, size and checksums. Failed or cancelled work must release
  the snapshots it owns without removing another build's files.
- Apply reports which remote phases completed and whether the outcome is known.
  Do not retry writes or claim rollback when the server's result is unknown.
  Each apply uses a fresh preview; approval does not carry across dev revisions.
- Pull stages source writes and its target-bound baseline together. Ordinary
  failures restore originals; interrupted workers and failed rollback report
  uncertainty and retain recovery information. Unsupported definitions remain
  visible in coverage reports.
- JSON emits one result envelope. Streaming commands honor backpressure, bound
  buffering and emit a terminal result or error. Cancellation exits 130 unless
  the operation has already acknowledged its completed result.

## Packaging

Vite builds the CLI, its worker and lazy chunks into `dist`. It also copies the
`create-twenty-app` template and the CLI test-harness overlay there. Chokidar,
esbuild, tinyglobby and the CLI's TypeScript parser are runtime dependencies;
other imported libraries are bundled. The parser is separate from the app's
compiler used for typechecking.

The archive includes the command reference, contributor guide and application
module READMEs so their relative links also work outside a repository checkout.
It does not include the CLI's TypeScript implementation or tests.

For packaging changes, build and inspect the archive before release:

```bash
yarn workspace twenty pack --dry-run
```

Check both executable entry points, lazy chunks and templates in the packed
package. Smoke-test help and app initialization from an extracted archive with
its declared dependencies. This checks packaging without publishing anything.

## App integration tests

`app-template-overlay` supplies the integration-test setup for CLI-created apps.
It deploys the app before tests and uninstalls it afterward by invoking the
installed CLI with `--json`. Apps invoke the executable rather than import the
CLI as a library or add it as a dependency. See the
[template contract](docs/commands.md#create-an-app) for executable selection and
the [compiler requirements](src/app/typecheck/README.md) for project setup.
