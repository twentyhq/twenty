# Application tooling

See [Contributing](../../CONTRIBUTING.md) for package setup and tests, and the
[command reference](../../docs/commands.md) for user-visible behavior.

The `twenty` CLI owns filesystem operations, source loading, build, typecheck,
watching, pull and deployment. Apps use `twenty-sdk` to define application
metadata and runtime behavior. They do not import or depend on the CLI, which
is normally installed globally.

| Module                                   | Responsibility                                                       |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `project`                             | Locate the app and resolve its installed SDK and Node requirements   |
| `deployment`                          | Preview metadata changes, approve them, upload snapshots and sync    |
| [source](source/README.md)               | Discover and evaluate trusted app definitions in a disposable worker |
| [manifest](manifest/README.md)           | Construct and validate metadata, compile translations                |
| [bundles](bundles/README.md)             | Build artifacts and hold immutable snapshots for consumers           |
| [typecheck](typecheck/README.md)         | Check source and configuration with the app's TypeScript compiler    |
| [client](client/README.md)               | Invoke the app's installed client SDK generator                      |
| [pull](pull/README.md)                   | Reconcile remote metadata with source and a target-bound baseline    |
| [add](add/README.md)                     | Create starter definitions without replacing existing files          |
| [dev](dev/README.md)                     | Watch build inputs and schedule builds and remote apply              |
| [exec](exec/README.md)                   | Execute an installed logic function                                  |
| [function-logs](function-logs/README.md) | Stream application function logs                                     |

The worker isolates process exits, captures bounded output, filters inherited
CLI credentials and supports cancellation. It runs trusted developer code and
is not a security sandbox. Configurations containing functions stay inside the
worker; only serializable requests, results and diagnostics cross IPC.

Snapshots retain files until their consumers finish. Uploads verify containment,
size and checksums. Pull and scaffolding stage writes before exposing them to
file watchers. Keep these guarantees when simplifying implementation details.

## Package boundaries

The CLI imports the app's public SDK authoring exports and invokes its installed
client SDK generator. The [typecheck documentation](typecheck/README.md) describes
compiler resolution and project requirements.

Parity tests compare generated source, manifests and bundles with the repository
SDK. Command failure and cancellation tests inject tooling fixtures into a bundle
of the production worker; real-app tests exercise its compiler and bundler.
