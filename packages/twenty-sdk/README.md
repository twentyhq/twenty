<div align="center">
  <a href="https://twenty.com">
    <picture>
      <img alt="Twenty logo" src="https://raw.githubusercontent.com/twentyhq/twenty/2f25922f4cd5bd61e1427c57c4f8ea224e1d552c/packages/twenty-website/public/images/core/logo.svg" height="128">
    </picture>
  </a>
  <h1>Twenty SDK</h1>

<a href="https://www.npmjs.com/package/twenty-sdk"><img alt="NPM version" src="https://img.shields.io/npm/v/twenty-sdk.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://github.com/twentyhq/twenty/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/next.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/cx5n4Jzs57"><img alt="Join the community on Discord" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&logo=Twenty&labelColor=000000&logoWidth=20"></a>

</div>

A CLI and SDK to develop, build, and publish applications that extend [Twenty CRM](https://twenty.com).

- Type‑safe client and workspace entity typings
- Built‑in CLI for auth, generate, dev sync, one‑off sync, and uninstall
- Works great with the scaffolder: [create-twenty-app](https://www.npmjs.com/package/create-twenty-app)

## Prerequisites
- Node.js 18+ (recommended) and Yarn 4
- A Twenty workspace and an API key. Generate one at https://app.twenty.com/settings/api-webhooks

## Installation

```bash
npm install twenty-sdk
# or
yarn add twenty-sdk
```

## Getting started
You can either scaffold a new app or add the SDK to an existing one.

- Start new (recommended):
  ```bash
  npx create-twenty-app@latest my-twenty-app
  cd my-twenty-app
  ```
- Existing project: install the SDK as shown above, then use the CLI below.

## CLI quickstart
```bash
# Authenticate using your API key (CLI will prompt for it)
twenty auth login

# Add a new entity to your application (guided prompts)
twenty app add

# Generate a typed Twenty client and TypeScript definitions for your workspace entities
twenty app generate

# Start dev mode: automatically syncs changes to your workspace for instant testing
twenty app dev

# One‑time sync of local changes
twenty app sync

# Uninstall the application from the current workspace
twenty app uninstall
```

## Usage (SDK)
```typescript
// Example: import what you need from the SDK
import { /* your exports */ } from 'twenty-sdk';
```

## Publish your application
Applications are currently stored in [`twenty/packages/twenty-apps`](https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps).

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

Our team reviews contributions for quality, security, and reusability.

## Troubleshooting
- Auth errors: run `twenty auth login` again and ensure the API key has the required permissions.
- Typings out of date: run `twenty app generate` to refresh the client and types.
- Not seeing changes in dev: make sure dev mode is running (`twenty app dev`).

## Contributing
- See our [GitHub](https://github.com/twentyhq/twenty)
- Join our [Discord](https://discord.gg/cx5n4Jzs57)
