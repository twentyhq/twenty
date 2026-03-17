This is a [Twenty](https://twenty.com) application project bootstrapped with [`create-twenty-app`](https://www.npmjs.com/package/create-twenty-app).

## Getting Started

Start development mode — it auto-connects to your local Twenty server at localhost:3000:

```bash
yarn twenty dev
```

Open your Twenty instance and go to `/settings/applications` section to see the result.

## Available Commands

Run `yarn twenty help` to list all available commands. Common commands:

```bash
# Remotes & authentication
yarn twenty remote add --local   # Connect to local Twenty server
yarn twenty remote add <url>     # Connect to a remote server (OAuth)
yarn twenty remote list           # List all configured remotes
yarn twenty remote switch        # Switch default remote
yarn twenty remote status        # Check auth status
yarn twenty remote remove <name> # Remove a remote

# Development
yarn twenty dev           # Start dev mode (watch, build, sync, and auto-generate typed client)
yarn twenty build         # Build the application
yarn twenty deploy        # Deploy to a Twenty server
yarn twenty publish       # Publish to npm
yarn twenty add           # Add a new entity (object, field, function, front-component, role, view, navigation-menu-item)
yarn twenty exec          # Execute a function with JSON payload
yarn twenty logs          # Stream function logs
yarn twenty uninstall     # Uninstall app from server
```

## Integration Tests

If your project includes the example integration test (`src/__tests__/app-install.integration-test.ts`), you can run it with:

```bash
# Make sure a Twenty server is running at http://localhost:3000
yarn test
```

The test builds and installs the app, then verifies it appears in the applications list. Test configuration (API URL and API key) is defined in `vitest.config.ts`.

## LLMs instructions

Main docs and pitfalls are available in LLMS.md file.

## Learn More

To learn more about Twenty applications, take a look at the following resources:

- [twenty-sdk](https://www.npmjs.com/package/twenty-sdk) - learn about `twenty-sdk` tool.
- [Twenty doc](https://docs.twenty.com/) - Twenty's documentation.
- Join our [Discord](https://discord.gg/cx5n4Jzs57)

You can check out [the Twenty GitHub repository](https://github.com/twentyhq/twenty) - your feedback and contributions are welcome!
