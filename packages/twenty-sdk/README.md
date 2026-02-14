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

- Type‑safe client and workspace entity typings
- Built‑in CLI for auth, dev mode (watch & sync), generate, uninstall, and function management
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
  --workspace <name>   Use a specific workspace configuration (default: "default")
  -V, --version        output the version number
  -h, --help           display help for command

Commands:
  auth:login           Authenticate with Twenty
  auth:logout          Remove authentication credentials
  auth:status          Check authentication status
  auth:switch          Switch the default workspace
  auth:list            List all configured workspaces
  app:dev              Watch and sync local application changes
  app:generate         Generate Twenty client
  app:uninstall        Uninstall application from Twenty
  entity:add           Add a new entity to your application
  function:logs        Watch application function logs
  function:execute     Execute a logic function with a JSON payload
  help [command]       display help for command
```

In a scaffolded project (via `create-twenty-app`), use `yarn twenty <command>` instead of calling `twenty` directly. For example: `yarn twenty help`, `yarn twenty app:dev`, etc.

## Global Options

- `--workspace <name>`: Use a specific workspace configuration profile. Defaults to `default`. See Configuration for details.

## Commands

### Auth

Authenticate the CLI against your Twenty workspace.

- `twenty auth:login` — Authenticate with Twenty.
  - Options:
    - `--api-key <key>`: API key for authentication.
    - `--api-url <url>`: Twenty API URL (defaults to your current profile's value or `http://localhost:3000`).
  - Behavior: Prompts for any missing values, persists them to the active workspace profile, and validates the credentials.

- `twenty auth:logout` — Remove authentication credentials for the active workspace profile.

- `twenty auth:status` — Print the current authentication status (API URL, masked API key, validity).

- `twenty auth:list` — List all configured workspaces.
  - Behavior: Displays all available workspaces with their authentication status and API URLs. Shows which workspace is the current default.

- `twenty auth:switch [workspace]` — Switch the default workspace for authentication.
  - Arguments:
    - `workspace` (optional): Name of the workspace to switch to. If omitted, shows an interactive selection.
  - Behavior: Sets the specified workspace as the default, so subsequent commands use it without needing `--workspace`.

Examples:

```bash
# Login interactively (recommended)
twenty auth:login

# Provide values in flags
twenty auth:login --api-key $TWENTY_API_KEY --api-url https://api.twenty.com

# Login interactively for a specific workspace profile
twenty auth:login --workspace my-custom-workspace

# Check status
twenty auth:status

# Logout current profile
twenty auth:logout

# List all configured workspaces
twenty auth:list

# Switch default workspace interactively
twenty auth:switch

# Switch to a specific workspace
twenty auth:switch production
```

### App

Application development commands.

- `twenty app:dev [appPath]` — Start development mode: watch and sync local application changes.
  - Behavior: Builds your application (functions and front components), computes the manifest, syncs everything to your workspace, then watches the directory for changes and re-syncs automatically. Displays an interactive UI showing build and sync status in real time. Press Ctrl+C to stop.

- `twenty app:uninstall [appPath]` — Uninstall the application from the current workspace.

- `twenty app:generate [appPath]` — Generate the typed Twenty client for your application.

### Entity

- `twenty entity:add [entityType]` — Add a new entity to your application.
  - Arguments:
    - `entityType`: one of `function`, `front-component`, `object`, or `role`. If omitted, an interactive prompt is shown.
  - Options:
    - `--path <path>`: The path where the entity file should be created (relative to the current directory).
  - Behavior:
    - `object`: prompts for singular/plural names and labels, then creates a `*.object.ts` definition file.
    - `function`: prompts for a name and scaffolds a `*.function.ts` logic function file.
    - `front-component`: prompts for a name and scaffolds a `*.front-component.tsx` file.
    - `role`: prompts for a name and scaffolds a `*.role.ts` role definition file.

### Function

- `twenty function:logs [appPath]` — Stream application function logs.
  - Options:
    - `-u, --functionUniversalIdentifier <id>`: Only show logs for a specific function universal ID.
    - `-n, --functionName <name>`: Only show logs for a specific function name.

- `twenty function:execute [appPath]` — Execute a logic function with a JSON payload.
  - Options:
    - `-n, --functionName <name>`: Name of the function to execute (required if `-u` not provided).
    - `-u, --functionUniversalIdentifier <id>`: Universal ID of the function to execute (required if `-n` not provided).
    - `-p, --payload <payload>`: JSON payload to send to the function (default: `{}`).

Examples:

```bash
# Start dev mode (watch, build, and sync)
twenty app:dev

# Start dev mode with a custom workspace profile
twenty app:dev --workspace my-custom-workspace

# Add a new entity interactively
twenty entity:add

# Add a new function
twenty entity:add function

# Add a new front component
twenty entity:add front-component

# Generate client types
twenty app:generate

# Uninstall the app from the workspace
twenty app:uninstall

# Watch all function logs
twenty function:logs

# Watch logs for a specific function by name
twenty function:logs -n my-function

# Execute a function by name (with empty payload)
twenty function:execute -n my-function

# Execute a function with a JSON payload
twenty function:execute -n my-function -p '{"name": "test"}'

# Execute a function by universal identifier
twenty function:execute -u e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf -p '{"key": "value"}'
```

## Configuration

The CLI stores configuration per user in a JSON file:

- Location: `~/.twenty/config.json`
- Structure: Profiles keyed by workspace name. The active profile is selected with `--workspace <name>` or by the `defaultWorkspace` setting.

Example configuration file:

```json
{
  "defaultWorkspace": "prod",
  "profiles": {
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

- If a profile is missing, `apiUrl` defaults to `http://localhost:3000` until set.
- `twenty auth:login` writes the `apiUrl` and `apiKey` for the active workspace profile.
- `twenty auth:login --workspace custom-workspace` writes the `apiUrl` and `apiKey` for a custom `custom-workspace` profile.
- `twenty auth:switch` sets the `defaultWorkspace` field, which is used when `--workspace` is not specified.
- `twenty auth:list` shows all configured workspaces and their authentication status.


## Troubleshooting
- Auth errors: run `twenty auth:login` again and ensure the API key has the required permissions.
- Typings out of date: run `twenty app:generate` to refresh the client and types.
- Not seeing changes in dev: make sure dev mode is running (`twenty app:dev`).

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
# Example: npx nx run twenty-sdk:start -- auth:status
```

Or run the built CLI directly:

```bash
node packages/twenty-sdk/dist/cli.cjs <command>
```

### Resources
- See our [GitHub](https://github.com/twentyhq/twenty)
- Join our [Discord](https://discord.gg/cx5n4Jzs57)
