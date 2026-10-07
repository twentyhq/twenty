# Twenty CLI

Work with [Twenty](https://twenty.com) from your terminal: connect to workspaces,
inspect metadata and records, send API requests, and develop applications.

## Install

The CLI needs Node.js 24.5 or later.

```bash
npm install -g twenty
twenty --version
```

## Get started

```bash
twenty doctor --offline
twenty auth login --url https://acme.twenty.com --use
twenty metadata object list
twenty data list companies --limit 5
twenty open
```

Replace the example URL with your workspace's address. `--use` makes this
connection the default, even when another saved connection already is one. Use
`--remote <name>` to select another saved connection and `--json` for a
structured result. Saved connections live in `~/.twenty/config.json`.

Browser sign-in is supported on Twenty 2.42 and later. On older servers, sign in
with an [API key](docs/commands.md#connections-and-authentication) instead.

## Develop an application

App projects pin Yarn 4 in `packageManager`. Run `corepack enable` once so
`yarn` uses that version; if `corepack` is missing, install it with
`npm install -g corepack`. These steps use the default connection;
`twenty auth status` shows which one that is:

```bash
twenty app init my-app
cd my-app
yarn install
twenty app build
twenty app apply --create
twenty app dev
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

Apps created with `app init` declare the oldest Twenty version they support in
`engines.twenty`. `app exec` runs functions as the signed-in user, so it needs a
browser sign-in and Twenty 2.46 or later. With a browser sign-in, `app uninstall`
also needs Twenty 2.46 or later; on earlier versions, use an API key for it.

## CLI and app dependencies

The CLI is installed globally, separately from each app. Apps keep `twenty-sdk`
as a development dependency for authoring and build-time APIs, `typescript` for
checks, and `twenty-client-sdk` when they use a generated API client. Neither
apps nor SDK packages need `twenty` in their dependencies or devDependencies. In
CI, install a pinned version with `npm install -g twenty@<version>`.

The CLI owns builds and filesystem operations. It uses the app's installed
SDK authoring exports and TypeScript compiler. Configuration and project-reference
errors fail builds. See [build requirements](docs/commands.md#build-and-check-an-app)
for supported SDK exports and compiler configuration.

## Documentation

- [Command reference](docs/commands.md), authentication, flags, output, permissions
  and recovery for each workflow.
- [Contributing](CONTRIBUTING.md), building from source, package structure, tests
  and releases.
- [Application tooling](src/app/README.md), module responsibilities and invariants.

Run `twenty commands` for the command inventory or `twenty <command> --help` for
its arguments and options.

Generated next-step commands use PowerShell on Windows and POSIX shell syntax on macOS/Linux.
