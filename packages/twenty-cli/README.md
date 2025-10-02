# Twenty CLI (WIP WIP WIP - DO NOT USE)

A command-line interface for Twenty application development. Build, deploy, and manage Twenty applications with ease.

## Installation

```bash
# Install globally
npm install -g twenty-cli

# Or use npx
npx twenty-cli --help
```

## Quick Start

```bash
# Authenticate with Twenty
twenty auth login

# Create a new application
twenty app init my-app
cd my-app

# Start development mode (watches for changes and syncs automatically)
twenty app dev
```

## Commands

### Authentication

```bash
# Login to Twenty
twenty auth login

# Check authentication status
twenty auth status

# Logout
twenty auth logout
```

### Application Development

```bash
# Initialize a new application
twenty app init [name]

# Add a new core entity to your application
twenty app add [options]
  -p, --path <path>        Application directory path (default: current directory)

# Start development mode with file watching
twenty app dev [options]
  -p, --path <path>        Application directory path (default: current directory)
  -w, --workspace-id <id>  Workspace ID
  -d, --debounce <ms>      Debounce delay in milliseconds (default: 1000)

# Deploy application
twenty app deploy [options]
  -p, --path <path>        Application directory path (default: current directory)
  -w, --workspace-id <id>  Workspace ID
```

### Configuration

```bash
# Get configuration value
twenty config get [key]
  --global   Show global configuration
  --project  Show project configuration

# Set configuration value
twenty config set <key> <value>
  --global   Set in global configuration
  --project  Set in project configuration

# Remove configuration value
twenty config unset <key>
  --global   Remove from global configuration
  --project  Remove from project configuration

# List all configuration
twenty config list
  --global   Show only global configuration
  --project  Show only project configuration
```

## Configuration

The CLI supports both global and project-level configuration:

- **Global config**: `~/.twenty/config.json`
- **Project config**: `.twenty.json` in your project directory

Project configuration takes precedence over global configuration.

### Configuration Keys

- `apiUrl`: Twenty API URL (default: http://localhost:3000)
- `apiKey`: Your Twenty API key
- `workspaceId`: Default workspace ID for operations

## Application Structure

Each application in this package follows the standard Twenty application structure:

```
app-name/
├── twenty-app.json          # Application manifest
├── README.md               # Application documentation
├── DEVELOPMENT.md          # Development guide (optional)
├── functions/              # Serverless functions (optional)
│   ├── function1.ts
│   └── function2.ts
└── assets/                 # Static assets (optional)
    ├── icons/
    └── screenshots/
```

## Development Workflow

1. **Initialize**: Create a new application with `twenty app init`
2. **Develop**: Use `twenty app dev` to watch for changes and auto-sync

The development mode watches your application directory and automatically syncs changes to your Twenty workspace, providing a smooth development experience similar to Vercel or Heroku CLI.
