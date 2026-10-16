This is a [Twenty](https://twenty.com) application project developed with the [Twenty CLI](https://www.npmjs.com/package/twenty).

## Getting Started

First, authenticate to your workspace:

```bash
twenty auth login --url http://localhost:2020 --name local
```

Then, start development mode to sync your app and watch for changes:

```bash
twenty app dev
```

Open your Twenty instance and go to `/settings/applications` section to see the result.

## Available Commands

Run `twenty --help` to list all available commands. Common commands:

```bash
# Remotes & Authentication
twenty auth login --url http://localhost:2020 --name local     # Authenticate with Twenty
twenty auth status         # Check auth status
twenty remote use            # Set default remote
twenty remote list           # List all configured remotes
twenty remote remove <name>  # Remove a remote

# Application
twenty app dev            # Start dev mode (watch, build, sync, and auto-generate typed client)
twenty app add        # Scaffold a new entity (object, field, function, front-component, role, view, navigation-menu-item)
twenty app logs    # Stream function logs
twenty app exec    # Execute a function with JSON payload
twenty app uninstall  # Uninstall app from workspace
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
