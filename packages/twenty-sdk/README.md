<div align="center">
  <a href="https://twenty.com">
    <picture>
      <img alt="Twenty logo" src="https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-website-new/public/images/core/logo.svg" height="128">
    </picture>
  </a>
  <h1>Twenty SDK</h1>

<a href="https://www.npmjs.com/package/twenty-sdk"><img alt="NPM version" src="https://img.shields.io/npm/v/twenty-sdk.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://github.com/twentyhq/twenty/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/next.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/cx5n4Jzs57"><img alt="Join the community on Discord" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&logo=Twenty&labelColor=000000&logoWidth=20"></a>

</div>

A CLI and SDK to develop, build, and publish applications that extend [Twenty CRM](https://twenty.com).

## Quick start

The recommended way to start is with [create-twenty-app](https://www.npmjs.com/package/create-twenty-app):

```bash
npx create-twenty-app@latest my-twenty-app
cd my-twenty-app
yarn twenty dev
```

## Documentation

Full documentation is available at **[docs.twenty.com/developers/extend/apps](https://docs.twenty.com/developers/extend/apps/getting-started)**:

- [Getting Started](https://docs.twenty.com/developers/extend/apps/getting-started) — scaffolding, local server, authentication, dev mode
- [Building Apps](https://docs.twenty.com/developers/extend/apps/building) — entity definitions, API clients, testing, CLI reference
- [Publishing](https://docs.twenty.com/developers/extend/apps/publishing) — deploy, npm publish, marketplace

## Manual installation

If you are adding `twenty-sdk` to an existing project instead of using `create-twenty-app`:

```bash
yarn add twenty-sdk twenty-client-sdk
```

Then add a `twenty` script to your `package.json`:

```json
{
  "scripts": {
    "twenty": "twenty"
  }
}
```

Run `yarn twenty help` to see all available commands.

## Configuration

The CLI stores credentials per remote in `~/.twenty/config.json`. Run `yarn twenty remote add` to configure a remote, or `yarn twenty remote list` to see existing ones.

## Troubleshooting

- Auth errors: run `yarn twenty remote add` to re-authenticate.
- Typings out of date: restart `yarn twenty dev` to refresh the client and types.
- Not seeing changes in dev: make sure dev mode is running (`yarn twenty dev`).

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

### Running the CLI locally

```bash
npx nx run twenty-sdk:start -- <command>
```

### Resources

- See our [GitHub](https://github.com/twentyhq/twenty)
- Join our [Discord](https://discord.gg/cx5n4Jzs57)
