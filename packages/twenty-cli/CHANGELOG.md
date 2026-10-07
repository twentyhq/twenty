# Changelog

All notable changes to the [Twenty CLI](https://www.npmjs.com/package/twenty) are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0]

First release of the Twenty command line. Earlier versions published under the `twenty` package name are not related to this CLI.

### Added

- **Connections.** `twenty auth login` signs in with the browser or an API key and saves the connection in `~/.twenty/config.json`. `twenty auth` and `twenty remote` show, select, rename and remove saved connections.
- **Workspace inspection.** `twenty metadata` lists and describes objects and fields, `twenty data` lists and reads records, `twenty api` sends REST and GraphQL requests, and `twenty open` opens the workspace in the browser.
- **App development.** `twenty app init`, `add`, `build`, `typecheck`, `plan`, `apply`, `dev`, `pull`, `exec`, `logs` and `uninstall` create, check and sync apps with a workspace.
- **Diagnostics.** `twenty doctor` checks Node, the `twenty` executable on PATH, the configuration, the app's SDK and the workspace connection.
- **Scripting.** `--json` and `--format ndjson` print structured results, and `--no-input` disables prompts.
