# Twenty CLI

Work with [Twenty](https://twenty.com) from your terminal: connect to workspaces,
inspect metadata and records, send API requests, and develop applications.

Build this CLI from source using the instructions below. It supports
development-app deployment. Application publishing is not supported.

## Get started

Use Node.js 24.5 or later within Node 24 and the repository's Yarn setup. From
the repository root:

```bash
yarn nx build twenty-cli
node packages/twenty-cli/dist/cli.cjs --help
```

The examples below use `twenty` for the built executable. Run it as
`node /absolute/path/to/twenty/packages/twenty-cli/dist/cli.cjs`.

```bash
twenty doctor --offline
twenty auth login --url https://acme.twenty.com --name dev --use
twenty metadata object list
twenty data list companies --limit 5
twenty open
```

Replace the example URL with your workspace's address. Workspace commands do
not require an application project. Use `--remote <name>` to select another
saved connection and `--json` for a structured result.

## Develop an application

```bash
twenty app init my-app
cd my-app
yarn install
twenty app build
twenty app apply --create --remote dev
twenty app dev --remote dev
```

`app init` writes files without installing dependencies. `app build` checks the
project locally. `app apply --create` registers and installs a new development
app, uploads its build and synchronizes its metadata. Once registered, inspect
changes with `twenty app plan` before applying them. `app dev` watches inputs and
syncs successful builds.

Missing definitions imply remote deletions by default. Pass `--no-delete` to
preserve them. Object and field deletions require confirmation because they
also delete stored data. Pull can overwrite local edits; read its
[reconciliation rules](docs/commands.md#pull-an-app) before using it.

## CLI and app dependencies

The CLI is intended to be installed globally, separately from each app. Apps
keep `twenty-sdk` for authoring and runtime APIs, `typescript` for checks, and
`twenty-client-sdk` when they use a generated API client. Neither apps nor SDK
packages need `twenty` in their dependencies or devDependencies. CI can pin its
CLI installation separately.

The CLI owns builds and filesystem operations. It uses the app's installed
SDK authoring exports and TypeScript compiler. Configuration and project-reference
errors fail builds. See [build requirements](docs/commands.md#build-and-check-an-app)
for supported SDK exports and compiler configuration.

Use `twenty doctor --offline` to inspect which package owns the `twenty`
executable on PATH. A missing project-local CLI is normal.

## Documentation

- [Command reference](docs/commands.md), authentication, flags, output, permissions
  and recovery for each workflow.
- [Contributing](CONTRIBUTING.md), package structure, builds, tests and release checks.
- [Application tooling](src/app/README.md), module responsibilities and invariants.

Run `twenty commands` for the command inventory or `twenty <command> --help` for
its arguments and options.
