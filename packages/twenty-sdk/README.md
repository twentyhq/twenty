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
- Built‑in CLI for auth, generate, dev sync, one‑off sync, and uninstall
- Works great with the scaffolder: [create-twenty-app](https://www.npmjs.com/package/create-twenty-app)

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
  auth                 Authentication commands
  app                  Application development commands
  help [command]       display help for command
```

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
```

### App

Application development commands.

- `twenty app:sync [appPath]` — One-time sync of the application to your Twenty workspace.
  - Behavior: Compute your application's manifest and send it to your workspace to sync your application

- `twenty app:dev [appPath]` — Start development mode: sync local application changes.
  - Options:
    - `-d, --debounce <ms>`: Debounce delay in milliseconds (default: `1000`).
  - Behavior: Performs an initial sync, then watches the directory for changes and re-syncs after debounced edits. Press Ctrl+C to stop.

- `twenty app:uninstall [appPath]` — Uninstall the application from the current workspace.
  - Note: `twenty app:delete` exists as a hidden alias for backward compatibility.

- `twenty entity:add [entityType]` — Add a new entity to your application.
  - Arguments:
    - `entityType`: one of `function` or `object`. If omitted, an interactive prompt is shown.
  - Options:
    - `--path <path>`: The path where the entity file should be created (relative to the current directory).
  - Behavior:
    - `object`: prompts for singular/plural names and labels, then creates a new object definition file.
    - `function`: prompts for a name and scaffolds a serverless function file.

- `twenty app:generate [appPath]` — Generate the typed Twenty client for your application.

- `twenty function:logs [appPath]` — Stream application function logs.
  - Options:
    - `-u, --functionUniversalIdentifier <id>`: Only show logs for a specific function universal ID.
    - `-n, --functionName <name>`: Only show logs for a specific function name.

- `twenty function:execute [appPath]` — Execute a serverless function with a JSON payload.
  - Options:
    - `-n, --functionName <name>`: Name of the function to execute (required if `-u` not provided).
    - `-u, --functionUniversalIdentifier <id>`: Universal ID of the function to execute (required if `-n` not provided).
    - `-p, --payload <payload>`: JSON payload to send to the function (default: `{}`).

Examples:

```bash
# Start dev mode with default debounce
twenty app:dev

# Start dev mode with custom workspace profile
twenty app:dev --workspace my-custom-workspace

# Dev mode with custom debounce
twenty app:dev --debounce 1500

# One-time sync of the current directory
twenty app:sync

# Add a new object interactively
twenty entity:add

# Generate client types
twenty app:generate

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
- Structure: Profiles keyed by workspace name. The active profile is selected with `--workspace <name>`.

Example configuration file:

```json
{
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
- `twenty auth:login` writes the `apiUrl` and `apiKey` for the default profile.
- `twenty auth:login --workspace custom-workspace` writes the `apiUrl` and `apiKey` for a custom `custom-workspace` profile.


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
