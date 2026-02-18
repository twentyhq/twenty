This is a [Twenty](https://twenty.com) application project bootstrapped with [`create-twenty-app`](https://www.npmjs.com/package/create-twenty-app).

## Getting Started

First, authenticate to your workspace:

```bash
yarn twenty auth:login
```

Then, start development mode to sync your app and watch for changes:

```bash
yarn twenty app:dev
```

Open your Twenty instance and go to `/settings/applications` section to see the result.

## Available Commands

Run `yarn twenty help` to list all available commands. Common commands:

```bash
# Authentication
yarn twenty auth:login     # Authenticate with Twenty
yarn twenty auth:logout    # Remove credentials
yarn twenty auth:status    # Check auth status
yarn twenty auth:switch    # Switch default workspace
yarn twenty auth:list      # List all configured workspaces

# Application
yarn twenty app:dev        # Start dev mode (watch, build, sync, and auto-generate typed client)
yarn twenty entity:add     # Add a new entity (function, front-component, object, role)
yarn twenty function:logs  # Stream function logs
yarn twenty function:execute  # Execute a function with JSON payload
yarn twenty app:uninstall  # Uninstall app from workspace
```

## Learn More

To learn more about Twenty applications, take a look at the following resources:

- [twenty-sdk](https://www.npmjs.com/package/twenty-sdk) - learn about `twenty-sdk` tool.
- [Twenty doc](https://docs.twenty.com/) - Twenty's documentation.
- Join our [Discord](https://discord.gg/cx5n4Jzs57)

You can check out [the Twenty GitHub repository](https://github.com/twentyhq/twenty) - your feedback and contributions are welcome!
