<div align="center">
  <a href="https://twenty.com">
    <picture>
      <img alt="Twenty logo" src="https://raw.githubusercontent.com/twentyhq/twenty/2f25922f4cd5bd61e1427c57c4f8ea224e1d552c/packages/twenty-website/public/images/core/logo.svg" height="128">
    </picture>
  </a>
  <h1>Create Twenty App</h1>

<a href="https://www.npmjs.com/package/create-twenty-app"><img alt="NPM version" src="https://img.shields.io/npm/v/create-twenty-app.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://github.com/twentyhq/twenty/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/next.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/cx5n4Jzs57"><img alt="Join the community on Discord" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&logo=Twenty&labelColor=000000&logoWidth=20"></a>

</div>

Create Twenty App is the official scaffolding CLI for building apps on top of [Twenty CRM](https://twenty.com). It sets up a ready‑to‑run project that works seamlessly with the [twenty-sdk](https://www.npmjs.com/package/twenty-sdk).

- Zero‑config project bootstrap
- Preconfigured scripts for auth, dev mode (watch & sync), generate, uninstall, and function management
- Strong TypeScript support and typed client generation

## Documentation
See Twenty application documentation https://docs.twenty.com/developers/extend/capabilities/apps

## Prerequisites
- Node.js 24+ (recommended) and Yarn 4
- A Twenty workspace and an API key (create one at https://app.twenty.com/settings/api-webhooks)

## Quick start

```bash
npx create-twenty-app@latest my-twenty-app
cd my-twenty-app

# If you don't use yarn@4
corepack enable
yarn install

# Get help
yarn run help

# Authenticate using your API key (you'll be prompted)
yarn auth:login

# Add a new entity to your application (guided)
yarn entity:add

# Generate a typed Twenty client and workspace entity types
yarn app:generate

# Start dev mode: watches, builds, and syncs local changes to your workspace
yarn app:dev

# Watch your application's function logs
yarn function:logs

# Execute a function with a JSON payload
yarn function:execute -n my-function -p '{"key": "value"}'

# Uninstall the application from the current workspace
yarn app:uninstall
```

## What gets scaffolded
- A minimal app structure ready for Twenty
- TypeScript configuration
- Prewired scripts that wrap the `twenty` CLI from twenty-sdk
- Example placeholders to help you add entities, actions, and sync logic

## Next steps
- Explore the generated project and add your first entity with `yarn entity:add` (functions, front components, objects, roles).
- Keep your types up‑to‑date using `yarn app:generate`.
- Use `yarn app:dev` while you iterate — it watches, builds, and syncs changes to your workspace in real time.


## Publish your application
Applications are currently stored in `twenty/packages/twenty-apps`.

You can share your application with all Twenty users:

```bash
# pull the Twenty project
git clone https://github.com/twentyhq/twenty.git
cd twenty

# create a new branch
git checkout -b feature/my-awesome-app
```

- Copy your app folder into `twenty/packages/twenty-apps`.
- Commit your changes and open a pull request on https://github.com/twentyhq/twenty

```bash
git commit -m "Add new application"
git push
```

Our team reviews contributions for quality, security, and reusability before merging.

## Troubleshooting
- Auth prompts not appearing: run `yarn auth:login` again and verify the API key permissions.
- Types not generated: ensure `yarn app:generate` runs without errors, then re‑start `yarn app:dev`.

## Contributing
- See our [GitHub](https://github.com/twentyhq/twenty)
- Join our [Discord](https://discord.gg/cx5n4Jzs57)
