<div align="center">
  <a href="https://twenty.com">
    <picture>
      <img alt="Twenty logo" src="https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-website/public/images/core/logo.svg" height="128">
    </picture>
  </a>
  <h1>Twenty SDK</h1>

<a href="https://www.npmjs.com/package/twenty-sdk"><img alt="NPM version" src="https://img.shields.io/npm/v/twenty-sdk.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://github.com/twentyhq/twenty/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/next.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/cx5n4Jzs57"><img alt="Join the community on Discord" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&logo=Twenty&labelColor=000000&logoWidth=20"></a>

</div>

The SDK for defining and building applications that extend [Twenty CRM](https://twenty.com).

> The CLI bundled with `twenty-sdk` is deprecated. Use the standalone [`twenty`](https://www.npmjs.com/package/twenty) CLI for new development. SDK library imports, including `twenty-sdk/define`, `twenty-sdk/front-component`, and `twenty-sdk/build`, remain supported. Keep `twenty-sdk` in your app dependencies.

## Quick start

```bash
npm install -g twenty
twenty app init my-twenty-app
cd my-twenty-app
yarn install
twenty auth login --url https://your-workspace.twenty.com --use
twenty app apply --create
twenty app dev
```

The standalone CLI needs Node.js 24.5 or later. App projects pin Yarn 4, enable Corepack before running `yarn install`. See the [CLI README](https://github.com/twentyhq/twenty/blob/main/packages/twenty-cli/README.md) for setup details.

## Migrate from the SDK CLI

Install `twenty` globally and run it directly from your terminal. If you previously installed `twenty-sdk` globally, uninstall that global copy first because both packages provide a `twenty` executable. Keep the app's local `twenty-sdk` dependency for its library imports.

`yarn twenty`, `npx twenty`, and package scripts can still select the app-local SDK executable. Use the globally installed `twenty` directly and run `twenty doctor --offline` to check executable ownership. For CI or package scripts, use the standalone CLI's explicit executable path if local binaries take precedence.

Common command replacements:

| SDK CLI                     | Standalone CLI                                      |
| --------------------------- | --------------------------------------------------- |
| `yarn twenty remote:add`    | `twenty auth login --url <url> --name <name> --use` |
| `yarn twenty remote:list`   | `twenty remote list`                                |
| `yarn twenty dev`           | `twenty app dev`                                    |
| `yarn twenty plan`          | `twenty app plan`                                   |
| `yarn twenty apply`         | `twenty app apply`                                  |
| `yarn twenty dev:build`     | `twenty app build`                                  |
| `yarn twenty dev:typecheck` | `twenty app typecheck`                              |
| `yarn twenty dev:add`       | `twenty app add`                                    |
| `yarn twenty app:uninstall` | `twenty app uninstall`                              |

These are workflow replacements, not flag-compatible aliases. Use `--path <appPath>` instead of a positional app path. For new apps, pass `--create` or approve the interactive registration prompt when first applying or starting dev mode; object and field deletions require confirmation or `--yes`. Read the [command reference](https://github.com/twentyhq/twenty/blob/main/packages/twenty-cli/docs/commands.md) before updating automation.

Existing SDK commands and `twenty-sdk/cli` imports remain available during the transition. The executable prints a deprecation warning to stderr; library imports do not. Workflows that need SDK-only commands such as `app:publish` can continue using them. `create-twenty-app` is unchanged by this deprecation.

## Documentation

Full documentation is available at **[docs.twenty.com/developers/extend/apps](https://docs.twenty.com/developers/extend/apps/getting-started)**:

- [Getting Started](https://docs.twenty.com/developers/extend/apps/getting-started) — scaffolding, local server, authentication, dev mode
- [Building Apps](https://docs.twenty.com/developers/extend/apps/building) — entity definitions, API clients, testing, CLI reference
- [Publishing](https://docs.twenty.com/developers/extend/apps/publishing) — deploy, npm publish, marketplace

Guides in this repository:

- [Programmatic application builds](./docs/build.md), local builds and typechecking for scripts and integrations
- [Logic function inputs](./docs/logic-function-inputs.md) — input schema inference, record-typed inputs, and the id contract

## Manual installation

To use the SDK in an existing app:

```bash
yarn add -D twenty-sdk
yarn add twenty-client-sdk
```

Use `twenty-sdk/define` for entity definitions and `twenty-client-sdk` when your app needs an API client. Install and invoke the standalone CLI separately, as above.

## Configuration

The standalone CLI stores saved workspace connections in `~/.twenty/config.json`. Run `twenty auth login` to sign in and `twenty auth status` to check the selected connection.

## Troubleshooting

- Deprecation warning still shown: your command resolved to the SDK's executable. Check shell aliases and run the standalone `twenty doctor --offline` to inspect PATH precedence.
- Auth errors: run `twenty auth login` to re-authenticate.
- Typings out of date: run `twenty app apply` to regenerate the client after syncing.
- Not seeing changes in dev: make sure `twenty app dev` is running.

## Contributing

### Development setup

```bash
git clone https://github.com/twentyhq/twenty.git
cd twenty
yarn install
```

### Development mode

```bash
npx nx run twenty-sdk:dev
```

### Production build

```bash
npx nx run twenty-sdk:build
```

### Running the deprecated SDK CLI locally

```bash
npx nx run twenty-sdk:start -- <command>
```

### Resources

- See our [GitHub](https://github.com/twentyhq/twenty)
- Join our [Discord](https://discord.gg/cx5n4Jzs57)
