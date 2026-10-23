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

The application authoring and runtime SDK for [Twenty CRM](https://twenty.com).

Use `twenty-sdk/define` to declare app entities, `twenty-sdk/front-component` for UI helpers, and `twenty-sdk/logic-function` for server-side helpers. The `billing` and `utils` exports remain available.

## Quick start

Install the standalone CLI separately from your app's SDK:

```bash
npm install -g twenty
twenty app init my-twenty-app
cd my-twenty-app
yarn install
twenty auth login --url https://your-workspace.twenty.com
twenty app dev --create
```

Keep `twenty-sdk` installed in each app. The global `twenty` package owns scaffolding, builds, authentication, sync, and publishing.

## Migration from the SDK CLI

The SDK no longer ships the `twenty` binary, `twenty-sdk/cli`, `twenty-sdk/build`, or the build descriptor. `create-twenty-app` is retired and prints migration instructions.

| Previous entry point                  | Replacement                            |
| ------------------------------------- | -------------------------------------- |
| `create-twenty-app`                   | `twenty app init`, then `yarn install` |
| `yarn twenty dev`                     | `twenty app dev`                       |
| `yarn twenty apply` / `plan` / `pull` | `twenty app apply` / `plan` / `pull`   |
| `yarn twenty dev:build`               | `twenty app build`                     |
| `yarn twenty dev:typecheck`           | `twenty app typecheck`                 |
| `yarn twenty dev:generate-client`     | `twenty app generate-client`           |
| `yarn twenty app:publish`             | `twenty app publish`                   |
| Programmatic CLI/build imports        | Spawn the standalone CLI with `--json` |

Use `twenty auth login` to configure a remote. For scripts, set `TWENTY_API_URL` and `TWENTY_API_KEY`. The standalone CLI does not use the SDK's `config.test.json` file. Run `twenty doctor` if an older SDK binary still shadows your global CLI.

The SDK's renderer integration exports remain available for the Twenty platform.

## Documentation

- [CLI reference](https://docs.twenty.com/developers/extend/apps/operations/cli)
- [Testing apps](https://docs.twenty.com/developers/extend/apps/operations/testing)
- [Logic function inputs](./docs/logic-function-inputs.md)

## Contributing

```bash
yarn install
npx nx build twenty-sdk
npx nx run twenty-sdk:test:unit
```

To work on CLI behavior, use `packages/twenty-cli` and `npx nx build twenty-cli`.
