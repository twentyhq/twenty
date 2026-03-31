<div align="center">
  <a href="https://twenty.com">
    <picture>
      <img alt="Twenty logo" src="https://raw.githubusercontent.com/twentyhq/twenty/2f25922f4cd5bd61e1427c57c4f8ea224e1d552c/packages/twenty-website/public/images/core/logo.svg" height="128">
    </picture>
  </a>
  <h1>Twenty SDK</h1>

<a href="https://www.npmjs.com/package/twenty-sdk"><img alt="NPM version" src="https://img.shields.io/npm/v/twenty-sdk.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://github.com/twentyhq/twenty/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/next.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/cx5n4Jzs57"><img alt="Join the community on Discord" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&logo=Twenty&labelColor=000000&logoWidth=20"></a>

</div>

A CLI and SDK to develop, build, and publish applications that extend [Twenty CRM](https://twenty.com).

- Typed GraphQL clients: `CoreApiClient` (auto-generated per app for workspace data) and `MetadataApiClient` (pre-built with the SDK for workspace configuration & file uploads)
- Built‑in CLI for auth, dev mode (watch & sync), uninstall, and function management

## Getting Started

The recommended way to start building a Twenty app is with [**create-twenty-app**](https://www.npmjs.com/package/create-twenty-app), which scaffolds a project with everything preconfigured:

```bash
npx create-twenty-app@latest my-app
cd my-app
yarn twenty dev
```

See the [create-twenty-app README](https://www.npmjs.com/package/create-twenty-app) or the [full documentation](https://docs.twenty.com/developers/extend/capabilities/apps) for details.

## Prerequisites

- Node.js 24+ (recommended) and Yarn 4
- Docker (for the local Twenty dev server) or a remote Twenty workspace

## Manual Installation

If you're adding `twenty-sdk` to an existing project instead of using `create-twenty-app`:

```bash
npm install twenty-sdk
# or
yarn add twenty-sdk
```

## Usage

```
Usage: twenty [options] [command]

CLI for Twenty application development

Options:
  -V, --version       output the version number
  -r, --remote <name> Use a specific remote (overrides the default set by remote switch)
  -h, --help          display help for command

Commands:
  dev [appPath]       Watch and sync local application changes
  build [appPath]     Build, sync, and generate API client into .twenty/output/
  deploy [appPath]    Build and deploy to a Twenty server
  publish [appPath]   Build and publish to npm
  typecheck [appPath] Run TypeScript type checking on the application
  uninstall [appPath] Uninstall application from Twenty
  remote              Manage remote Twenty servers
  server              Manage a local Twenty server instance
  add [entityType]    Add a new entity to your application
  exec [appPath]      Execute a logic function with a JSON payload
  logs [appPath]      Watch application function logs
  help [command]      display help for command
```

In a project created with `create-twenty-app` (recommended), use `yarn twenty <command>` instead of calling `twenty` directly. For example: `yarn twenty help`, `yarn twenty dev`, etc.

## Global Options

- `--remote <name>` (or `-r <name>`): Use a specific remote configuration. Defaults to `local`. See Configuration for details.

## Commands

### Server

Manage a local Twenty dev server (all-in-one Docker image on port 2020). These commands only apply to the Docker-based dev server — they do not manage a Twenty instance started from source (e.g. `npx nx start twenty-server` on port 3000).

- `twenty server start` — Start the local server (pulls image if needed). Automatically configures the `local` remote.
  - Options:
    - `-p, --port <port>`: HTTP port (default: `2020`).
- `twenty server stop` — Stop the local server.
- `twenty server logs` — Stream server logs.
  - Options:
    - `-n, --lines <lines>`: Number of initial lines to show (default: `50`).
- `twenty server status` — Show server status (running/stopped/healthy).
- `twenty server reset` — Delete all data and start fresh.

The server comes pre-seeded with a workspace and user (`tim@apple.dev` / `tim@apple.dev`).

Examples:

```bash
# Start the local server
twenty server start

# Check if it's ready
twenty server status

# Follow logs during first startup
twenty server logs

# Stop the server (data is preserved)
twenty server stop

# Wipe everything and start over
twenty server reset
```

### Remote

Manage remote server connections and authentication.

- `twenty remote add [nameOrUrl]` — Add a new remote or re-authenticate an existing one.

  - Options:
    - `--token <token>`: API key for non-interactive auth.
    - `--url <url>`: Server URL (alternative to positional arg).
    - `--as <name>`: Name for this remote (otherwise derived from URL hostname).
  - Behavior: If `nameOrUrl` matches an existing remote name, re-authenticates it. Otherwise, creates a new remote and authenticates via OAuth (with API key fallback).

- `twenty remote remove <name>` — Remove a remote and its credentials.

- `twenty remote list` — List all configured remotes with their auth status and URLs.

- `twenty remote switch [name]` — Set the default remote.

  - If omitted, shows an interactive selection.

- `twenty remote status` — Print the current remote name, server URL, and auth status.

Examples:

```bash
# Add a remote interactively (recommended)
twenty remote add

# Provide values in flags (non-interactive, for CI)
twenty remote add https://api.twenty.com --token $TWENTY_API_KEY

# Name a remote explicitly
twenty remote add https://api.twenty.com --as production

# Re-authenticate an existing remote by name
twenty remote add production

# Check status
twenty remote status

# List all configured remotes
twenty remote list

# Switch default remote
twenty remote switch production

# Remove a remote
twenty remote remove production
```

### App

Application development commands.

- `twenty dev [appPath]` — Start development mode: watch and sync local application changes.

  - Behavior: Builds your application (functions and front components), computes the manifest, syncs everything to your remote, then watches the directory for changes and re-syncs automatically. Displays an interactive UI showing build and sync status in real time. Press Ctrl+C to stop.

- `twenty build [appPath]` — Build the application, sync to the server, generate the typed API client, then rebuild with the real client.

  - Options:
    - `--tarball`: Also pack the output into a `.tgz` tarball.

- `twenty publish [appPath]` — Build and publish the application to npm.

  - Behavior: Builds the application and runs `npm publish` on the output directory.
  - Options:
    - `--tag <tag>`: npm dist-tag (e.g. `beta`, `next`).

- `twenty deploy [appPath]` — Build and deploy the application to a Twenty server.

  - Behavior: Builds the tarball, uploads it to the server, and installs the application.
  - Options:
    - `--server <url>`: Target Twenty server URL.
    - `--token <token>`: Auth token for the server.

- `twenty typecheck [appPath]` — Run TypeScript type checking on the application (runs `tsc --noEmit`). Exits with code 1 if type errors are found.

- `twenty uninstall [appPath]` — Uninstall the application from the current remote.

### Entity

- `twenty add [entityType]` — Add a new entity to your application.
  - Arguments:
    - `entityType`: one of `object`, `field`, `function`, `front-component`, `role`, `view`, `navigation-menu-item`, or `skill`. If omitted, an interactive prompt is shown.
  - Options:
    - `--path <path>`: The path where the entity file should be created (relative to the current directory).
  - Behavior:
    - `object`: prompts for singular/plural names and labels, then creates a `*.object.ts` definition file.
    - `field`: prompts for name, label, type, and target object, then creates a `*.field.ts` definition file.
    - `function`: prompts for a name and scaffolds a `*.function.ts` logic function file.
    - `front-component`: prompts for a name and scaffolds a `*.front-component.tsx` file.
    - `role`: prompts for a name and scaffolds a `*.role.ts` role definition file.
    - `view`: prompts for a name and target object, then creates a `*.view.ts` definition file.
    - `navigation-menu-item`: prompts for a name and scaffolds a `*.navigation-menu-item.ts` file.
    - `skill`: prompts for a name and scaffolds a `*.skill.ts` skill definition file.

### Function

- `twenty logs [appPath]` — Stream application function logs.

  - Options:
    - `-u, --functionUniversalIdentifier <id>`: Only show logs for a specific function universal ID.
    - `-n, --functionName <name>`: Only show logs for a specific function name.

- `twenty exec [appPath]` — Execute a logic function with a JSON payload.
  - Options:
    - `--preInstall`: Execute the pre-install logic function defined in the application manifest (required if `--postInstall`, `-n`, and `-u` not provided).
    - `--postInstall`: Execute the post-install logic function defined in the application manifest (required if `--preInstall`, `-n`, and `-u` not provided).
    - `-n, --functionName <name>`: Name of the function to execute (required if `--postInstall` and `-u` not provided).
    - `-u, --functionUniversalIdentifier <id>`: Universal ID of the function to execute (required if `--postInstall` and `-n` not provided).
    - `-p, --payload <payload>`: JSON payload to send to the function (default: `{}`).

Examples:

```bash
# Start dev mode (watch, build, and sync)
twenty dev

# Start dev mode with a custom remote
twenty dev --remote my-custom-remote

# Type check the application
twenty typecheck

# Add a new entity interactively
twenty add

# Add a new function
twenty add function

# Add a new front component
twenty add front-component

# Add a new view
twenty add view

# Add a new navigation menu item
twenty add navigation-menu-item

# Add a new skill
twenty add skill

# Build the app (output in .twenty/output/)
twenty build

# Build and create a tarball
twenty build --tarball

# Publish to npm
twenty publish

# Publish with a dist-tag
twenty publish --tag beta

# Deploy directly to a Twenty server (builds, uploads, and installs)
twenty deploy --server https://app.twenty.com

# Uninstall the app from the remote
twenty uninstall

# Watch all function logs
twenty logs

# Watch logs for a specific function by name
twenty logs -n my-function

# Execute a function by name (with empty payload)
twenty exec -n my-function

# Execute a function with a JSON payload
twenty exec -n my-function -p '{"name": "test"}'

# Execute a function by universal identifier
twenty exec -u e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf -p '{"key": "value"}'

# Execute the pre-install function
twenty exec --preInstall

# Execute the post-install function
twenty exec --postInstall
```

## Configuration

The CLI stores configuration per user in a JSON file:

- Location: `~/.twenty/config.json`
- Structure: Remotes keyed by name. The active remote is selected with `--remote <name>` or by the `defaultRemote` setting.

Example configuration file:

```json
{
  "defaultRemote": "production",
  "remotes": {
    "local": {
      "apiUrl": "http://localhost:2020",
      "apiKey": "<your-api-key>"
    },
    "production": {
      "apiUrl": "https://api.twenty.com",
      "accessToken": "<oauth-token>",
      "refreshToken": "<refresh-token>",
      "oauthClientId": "<client-id>"
    }
  }
}
```

Notes:

- If a remote is missing, `apiUrl` defaults to `http://localhost:2020`.
- `twenty remote add` writes credentials for the active remote (OAuth tokens or API key).
- `twenty remote add --as my-remote` saves under a custom name.
- `twenty remote switch` sets the `defaultRemote` field, used when `-r` is not specified.
- `twenty remote list` shows all configured remotes and their authentication status.

## How to use a local Twenty instance

If you're already running a local Twenty instance, you can connect to it instead of using Docker:

```bash
twenty remote add http://localhost:3000 --as local
```

## Troubleshooting

- Auth errors: run `twenty remote add` again (or add a new remote) and ensure the API key has the required permissions.
- Typings out of date: restart `twenty dev` to refresh the client and types.
- Not seeing changes in dev: make sure dev mode is running (`twenty dev`).

## Contributing

### Development Setup

To contribute to the twenty-sdk package, clone the repository and install dependencies:

```bash
git clone https://github.com/twentyhq/twenty.git
cd twenty
yarn install
```

### Development Mode

Run the SDK build in watch mode to automatically rebuild on file changes:

```bash
npx nx run twenty-sdk:dev
```

This will watch for changes and rebuild the `dist` folder automatically.

### Production Build

Build the SDK for production:

```bash
npx nx run twenty-sdk:build
```

### Running the CLI Locally

After building, you can run the CLI directly:

```bash
npx nx run twenty-sdk:start -- <command>
# Example: npx nx run twenty-sdk:start -- remote status
```

Or run the built CLI directly:

```bash
node packages/twenty-sdk/dist/cli.cjs <command>
```

### Resources

- See our [GitHub](https://github.com/twentyhq/twenty)
- Join our [Discord](https://discord.gg/cx5n4Jzs57)
