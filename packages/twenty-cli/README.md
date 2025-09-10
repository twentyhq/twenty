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

# Deploy to Twenty
twenty app deploy
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

# Start development mode with file watching
twenty app dev [options]
  -p, --path <path>        Application directory path (default: current directory)
  -w, --workspace-id <id>  Workspace ID
  -d, --debounce <ms>      Debounce delay in milliseconds (default: 1000)
  --verbose                Enable verbose logging

# Deploy application
twenty app deploy [options]
  -p, --path <path>        Application directory path (default: current directory)
  -w, --workspace-id <id>  Workspace ID

# Install application from source
twenty app install [options]
  -s, --source <source>    Application source (git URL, local path, or marketplace ID)
  -t, --type <type>        Source type: git, local, marketplace (default: local)
  -w, --workspace-id <id>  Workspace ID

# List installed applications
twenty app list [options]
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

A Twenty application requires a `twenty-app.json` manifest file:

```json
{
  "universalIdentifier": "com.example.myapp",
  "label": "My App",
  "description": "A Twenty application",
  "version": "1.0.0",
  "agents": [
    {
      "universalIdentifier": "com.example.myapp.agent1",
      "name": "my-agent",
      "label": "My Agent",
      "description": "An AI agent",
      "prompt": "You are a helpful assistant...",
      "modelId": "gpt-4",
      "responseFormat": {
        "type": "text"
      }
    }
  ]
}
```

## Development Workflow

1. **Initialize**: Create a new application with `twenty app init`
2. **Develop**: Use `twenty app dev` to watch for changes and auto-sync
3. **Deploy**: Use `twenty app deploy` to deploy to production

The development mode watches your application directory and automatically syncs changes to your Twenty workspace, providing a smooth development experience similar to Vercel or Heroku CLI.

## Examples

```bash
# Create and develop a new app
twenty app init customer-support-agent
cd customer-support-agent
twenty app dev --workspace-id ws_123

# Deploy an existing app
cd my-existing-app
twenty app deploy --workspace-id ws_123

# Install an app from git
twenty app install --source https://github.com/user/twenty-app.git --type git

# Configure for a specific workspace
twenty config set workspaceId ws_123 --project
```

## API Integration

The CLI communicates with Twenty via HTTP APIs:

- Authentication via API keys
- File watching and debounced syncing
- RESTful API calls for all operations
- Automatic retry and error handling

This approach ensures the CLI works independently of the Twenty server codebase and can be distributed as a standalone tool.
