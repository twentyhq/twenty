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
- Works great with the scaffolder: [create-twenty-app](https://www.npmjs.com/package/create-twenty-app)

## Documentation

See Twenty application documentation https://docs.twenty.com/developers/extend/capabilities/apps

## Prerequisites

- Node.js 24+ (recommended) and Yarn 4
- A Twenty workspace and an API key. Generate one at https://app.twenty.com/settings/api-webhooks

## Installation

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
  --remote <name>   Use a specific remote configuration (default: "default")
  -V, --version        output the version number
  -h, --help           display help for command

Commands:
  remote add       Add a remote server connection
  remote list      List all configured remotes
  remote switch    Switch the default remote
  logout           Remove authentication credentials
  whoami           Check authentication status
  dev              Watch and sync local application changes
  build            Build, sync, and generate API client
  publish          Build and publish to npm
  deploy           Build and deploy to a Twenty server
  typecheck        Run TypeScript type checking on the application
  uninstall        Uninstall application from Twenty
  add              Add a new entity to your application
  logs             Watch application function logs
  exec             Execute a logic function with a JSON payload
  help [command]       display help for command
```

In a scaffolded project (via `create-twenty-app`), use `yarn twenty <command>` instead of calling `twenty` directly. For example: `yarn twenty help`, `yarn twenty dev`, etc.

## Global Options

- `--remote <name>` (or `-r <name>`): Use a specific remote configuration. Defaults to `default`. See Configuration for details.

## Commands

### Remote

Manage remote server connections and authentication.

- `twenty remote add` — Add a remote server connection.

  - Options:
    - `--api-key <key>`: API key for authentication.
    - `--api-url <url>`: Twenty API URL (defaults to your current remote's value or `http://localhost:3000`).
    - `--local`: Shorthand for `--api-url http://localhost:3000`.
  - Behavior: Prompts for any missing values, persists them to the active remote, and validates the credentials.

- `twenty logout` — Remove authentication credentials for the active remote.

- `twenty whoami` — Print the current authentication status (API URL, masked API key, validity).

- `twenty remote list` — List all configured remotes.

  - Behavior: Displays all available remotes with their authentication status and API URLs. Shows which remote is the current default.

- `twenty remote switch [remote]` — Switch the default remote.
  - Arguments:
    - `remote` (optional): Name of the remote to switch to. If omitted, shows an interactive selection.
  - Behavior: Sets the specified remote as the default, so subsequent commands use it without needing `--remote`.

Examples:

```bash
# Add a remote interactively (recommended)
twenty remote add

# Provide values in flags
twenty remote add --api-key $TWENTY_API_KEY --api-url https://api.twenty.com

# Add a local development remote
twenty remote add --local

# Add a remote for a specific named configuration
twenty remote add --remote my-custom-remote

# Check status
twenty whoami

# Logout current remote
twenty logout

# List all configured remotes
twenty remote list

# Switch default remote interactively
twenty remote switch

# Switch to a specific remote
twenty remote switch production
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
  "defaultRemote": "prod",
  "remotes": {
    "default": {
      "apiUrl": "http://localhost:3000",
      "apiKey": "<your-api-key>"
    },
    "prod": {
      "apiUrl": "https://api.twenty.com",
      "apiKey": "<your-api-key>"
    }
  }
}
```

Notes:

- If a remote is missing, `apiUrl` defaults to `http://localhost:3000` until set.
- `twenty remote add` writes the `apiUrl` and `apiKey` for the active remote.
- `twenty remote add --remote custom-remote` writes the `apiUrl` and `apiKey` for a custom `custom-remote` remote.
- `twenty remote switch` sets the `defaultRemote` field, which is used when `--remote` is not specified.
- `twenty remote list` shows all configured remotes and their authentication status.

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
# Example: npx nx run twenty-sdk:start -- whoami
```

Or run the built CLI directly:

```bash
node packages/twenty-sdk/dist/cli.cjs <command>
```

### Resources

- See our [GitHub](https://github.com/twentyhq/twenty)
- Join our [Discord](https://discord.gg/cx5n4Jzs57)
