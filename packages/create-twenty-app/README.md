<div align="center">
  <a href="https://twenty.com">
    <picture>
      <img alt="Twenty logo" src="https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-website-new/public/images/core/logo.svg" height="128">
    </picture>
  </a>
  <h1>Create Twenty App</h1>

<a href="https://www.npmjs.com/package/create-twenty-app"><img alt="NPM version" src="https://img.shields.io/npm/v/create-twenty-app.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://github.com/twentyhq/twenty/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/next.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/cx5n4Jzs57"><img alt="Join the community on Discord" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&logo=Twenty&labelColor=000000&logoWidth=20"></a>

</div>

The official scaffolding CLI for building apps on top of [Twenty CRM](https://twenty.com). Sets up a ready-to-run project with [twenty-sdk](https://www.npmjs.com/package/twenty-sdk).

## Quick start

```bash
npx create-twenty-app@latest my-twenty-app
cd my-twenty-app
yarn twenty dev
```

The scaffolder will:

1. Create a new project with TypeScript, linting, tests, and a preconfigured `twenty` CLI
2. Optionally start a local Twenty server (Docker)
3. Open the browser for OAuth authentication

## Options

| Flag                           | Description                             |
| ------------------------------ | --------------------------------------- |
| `--example <name>`             | Initialize from an example              |
| `--name <name>`                | Set the app name (skips the prompt)     |
| `--display-name <displayName>` | Set the display name (skips the prompt) |
| `--description <description>`  | Set the description (skips the prompt)  |
| `--skip-local-instance`        | Skip the local server setup prompt      |

By default (no flags), a minimal app is generated with core files and an integration test. Use `--example` to start from a richer example:

```bash
npx create-twenty-app@latest my-twenty-app --example hello-world
```

Examples are sourced from [twentyhq/twenty/packages/twenty-apps/examples](https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/examples).

## Documentation

Full documentation is available at **[docs.twenty.com/developers/extend/apps](https://docs.twenty.com/developers/extend/apps/getting-started)**:

- [Getting Started](https://docs.twenty.com/developers/extend/apps/getting-started) — step-by-step setup, project structure, server management, CI
- [Building Apps](https://docs.twenty.com/developers/extend/apps/building) — entity definitions, API clients, testing
- [Publishing](https://docs.twenty.com/developers/extend/apps/publishing) — deploy, npm publish, marketplace

## Troubleshooting

- Server not starting: check Docker is running (`docker info`), then try `yarn twenty server logs`.
- Auth not working: make sure you are logged in to Twenty in the browser, then run `yarn twenty remote add`.
- Types not generated: ensure `yarn twenty dev` is running — it auto-generates the typed client.

## Contributing

- See our [GitHub](https://github.com/twentyhq/twenty)
- Join our [Discord](https://discord.gg/cx5n4Jzs57)
