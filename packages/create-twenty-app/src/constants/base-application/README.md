This is a [Twenty](https://twenty.com) application project bootstrapped with [`create-twenty-app`](https://www.npmjs.com/package/create-twenty-app).

## Getting Started

First, authenticate to your workspace:

```bash
yarn auth:login
```

Then, start development mode to sync your app and watch for changes:

```bash
yarn app:dev
```

Or run a one-time sync:

```bash
yarn app:sync
```

Open your Twenty instance and go to `/settings/applications` section to see the result.

## Available Commands

```bash
# Authentication
yarn auth:login     # Authenticate with Twenty
yarn auth:logout    # Remove credentials
yarn auth:status    # Check auth status

# Application
yarn app:dev        # Start dev mode (sync + watch)
yarn app:sync       # One-time sync
yarn entity:add     # Add a new entity (function, object, role)
yarn app:generate   # Generate typed Twenty client
yarn function:logs  # Stream function logs
yarn app:uninstall  # Uninstall app from workspace
```

## Learn More

To learn more about Twenty applications, take a look at the following resources:

- [twenty-sdk](https://www.npmjs.com/package/twenty-sdk) - learn about `twenty-sdk` tool.
- [Twenty doc](https://docs.twenty.com/) - Twenty's documentation.
- Join our [Discord](https://discord.gg/cx5n4Jzs57)

You can check out [the Twenty GitHub repository](https://github.com/twentyhq/twenty) - your feedback and contributions are welcome!
