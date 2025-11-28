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

This CLI tool enables you to quickly start building a new Twenty application, with everything set up for you. To get started, use the following command:

## Basic Usage

```bash
npx create-twenty-app@latest [project-name]

cd [project-name]

# Add a new entity to your application
yarn create-entity

# Authenticate using a Twenty Api Key
yarn auth

# Load twenty client and workspace types
yarn generate

# Start dev mode: automatically syncs changes to your Twenty workspace, so you can test new functions/objects instantly.
yarn dev

# Or use one time sync
yarn sync

# Uninstall application from workspace
yarn uninstall
```

## Twenty-sdk
See [twenty-sdk](https://www.npmjs.com/package/twenty-sdk) tool for detailed documentation

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
