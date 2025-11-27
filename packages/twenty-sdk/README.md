<div align="center">
  <a href="https://twenty.com">
    <picture>
      <img alt="Twenty logo" src="https://raw.githubusercontent.com/twentyhq/twenty/2f25922f4cd5bd61e1427c57c4f8ea224e1d552c/packages/twenty-website/public/images/core/logo.svg" height="128">
    </picture>
  </a>
  <h1>Twenty sdk</h1>

<a href="https://www.npmjs.com/package/twenty-sdk"><img alt="NPM version" src="https://img.shields.io/npm/v/twenty-sdk.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://github.com/twentyhq/twenty/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/next.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/cx5n4Jzs57"><img alt="Join the community on Discord" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&logo=Twenty&labelColor=000000&logoWidth=20"></a>

</div>

A command-line interface and an SDK to easily scaffold, develop, and publish applications that extend [Twenty CRM](https://twenty.com).

## Installation

```bash
npm install twenty-sdk
# or
yarn add twenty-sdk
```

## Requirements
An `apiKey`. Go to [https://app.twenty.com/settings/api-webhooks](https://app.twenty.com/settings/api-webhooks) to generate one

## Quick example project

```bash
# Authenticate using your apiKey (CLI will prompt for your <apiKey>)
twenty auth login

# Init a new application called hello-world
twenty app init hello-world

# Go to your app
cd hello-world

# Add an entity to your application
yarn create

# Start dev mode: automatically syncs changes to your Twenty workspace, so you can test new functions/objects instantly.
yarn dev

# Or use one time sync (also generates SDK automatically)
yarn sync
```

## Usage

```typescript
import { /* your exports */ } from 'twenty-sdk';
```

## Development

```bash
# Build
npx nx build twenty-sdk

# Lint
npx nx lint twenty-sdk

# Test
npx nx test twenty-sdk

# Test e2e
npx nx test:e2e twenty-sdk
```

## Publish your application

Applications are currently stored in twenty/packages/twenty-apps.

You can share your application with all twenty users.

```bash
# pull twenty project
git clone https://github.com/twentyhq/twenty.git
cd twenty

# create a new branch
git checkout -b feature/my-awesome-app
```

- copy your app folder into twenty/packages/twenty-apps
- commit your changes and open a pull request on https://github.com/twentyhq/twenty

```bash
git commit -m "Add new application"
git push
```

Our team reviews contributions for quality, security, and reusability before merging.

## Contributing

- see our [Github](https://github.com/twentyhq/twenty)
- our [Discord](https://discord.gg/cx5n4Jzs57)
