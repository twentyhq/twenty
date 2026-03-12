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
- Preconfigured scripts for auth, dev mode (watch & sync), uninstall, and function management
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

# Get help and list all available commands
yarn twenty help

# Authenticate using your API key (you'll be prompted)
yarn twenty auth:login

# Add a new entity to your application (guided)
yarn twenty entity:add

# Start dev mode: watches, builds, and syncs local changes to your workspace
# (also auto-generates typed CoreApiClient — MetadataApiClient ships pre-built with the SDK — both available via `twenty-sdk/clients`)
yarn twenty app:dev

# Watch your application's function logs
yarn twenty function:logs

# Execute a function with a JSON payload
yarn twenty function:execute -n my-function -p '{"key": "value"}'

# Execute the pre-install function
yarn twenty function:execute --preInstall

# Execute the post-install function
yarn twenty function:execute --postInstall

# Build the app for distribution
yarn twenty app:build

# Publish the app to npm or directly to a Twenty server
yarn twenty app:publish

# Uninstall the application from the current workspace
yarn twenty app:uninstall
```

## Scaffolding modes

Control which example files are included when creating a new app:

| Flag               | Behavior                                                                |
| ------------------ | ----------------------------------------------------------------------- |
| `-e, --exhaustive` | **(default)** Creates all example files                                 |
| `-m, --minimal`    | Creates only core files (`application-config.ts` and `default-role.ts`) |

```bash
# Default: all examples included
npx create-twenty-app@latest my-app

# Minimal: only core files
npx create-twenty-app@latest my-app -m
```

## What gets scaffolded

**Core files (always created):**

- `application-config.ts` — Application metadata configuration
- `roles/default-role.ts` — Default role for logic functions
- `logic-functions/pre-install.ts` — Pre-install logic function (runs before app installation)
- `logic-functions/post-install.ts` — Post-install logic function (runs after app installation)
- TypeScript configuration, Oxlint, package.json, .gitignore
- A prewired `twenty` script that delegates to the `twenty` CLI from twenty-sdk

**Example files (controlled by scaffolding mode):**

- `objects/example-object.ts` — Example custom object with a text field
- `fields/example-field.ts` — Example standalone field extending the example object
- `logic-functions/hello-world.ts` — Example logic function with HTTP trigger
- `front-components/hello-world.tsx` — Example front component
- `views/example-view.ts` — Example saved view for the example object
- `navigation-menu-items/example-navigation-menu-item.ts` — Example sidebar navigation link
- `skills/example-skill.ts` — Example AI agent skill definition
- `__tests__/app-install.integration-test.ts` — Integration test that builds, installs, and verifies the app (includes `vitest.config.ts`, `tsconfig.spec.json`, and a setup file)

## Next steps

- Run `yarn twenty help` to see all available commands.
- Use `yarn twenty auth:login` to authenticate with your Twenty workspace.
- Explore the generated project and add your first entity with `yarn twenty entity:add` (logic functions, front components, objects, roles, views, navigation menu items, skills).
- Use `yarn twenty app:dev` while you iterate — it watches, builds, and syncs changes to your workspace in real time.
- `CoreApiClient` (for workspace data via `/graphql`) is auto-generated by `yarn twenty app:dev`. `MetadataApiClient` (for workspace configuration and file uploads via `/metadata`) ships pre-built with the SDK. Both are available via `import { CoreApiClient, MetadataApiClient } from 'twenty-sdk/clients'`.

## Build and publish your application

Once your app is ready, build and publish it using the CLI:

```bash
# Build the app (output goes to .twenty/output/)
yarn twenty app:build

# Build and create a tarball (.tgz) for distribution
yarn twenty app:build --tarball

# Publish to npm (requires npm login)
yarn twenty app:publish

# Publish with a dist-tag (e.g. beta, next)
yarn twenty app:publish --tag beta

# Publish directly to a Twenty server (builds, uploads, and installs in one step)
yarn twenty app:publish --server https://app.twenty.com --token <your-api-token>
```

### Publish to the Twenty marketplace

You can also contribute your application to the curated marketplace:

```bash
git clone https://github.com/twentyhq/twenty.git
cd twenty
git checkout -b feature/my-awesome-app
```

- Copy your app folder into `twenty/packages/twenty-apps`.
- Commit your changes and open a pull request on https://github.com/twentyhq/twenty

Our team reviews contributions for quality, security, and reusability before merging.

## Troubleshooting

- Auth prompts not appearing: run `yarn twenty auth:login` again and verify the API key permissions.
- Types not generated: ensure `yarn twenty app:dev` is running — it auto‑generates the typed client.

## Contributing

- See our [GitHub](https://github.com/twentyhq/twenty)
- Join our [Discord](https://discord.gg/cx5n4Jzs57)
