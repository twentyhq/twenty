# Deprecated: twenty-cli

This package is deprecated. Please install and use twenty-sdk instead:

```bash
npm install -g twenty-sdk
```

The command name remains the same: twenty.

A command-line interface to easily scaffold, develop, and publish applications that extend Twenty CRM (now provided by twenty-sdk).

## Requirements
- yarn >= 4.9.2
- an `apiKey`. Go to `https://twenty.com/settings/api-webhooks` to generate one

## Quick example project

```bash
# Authenticate using your apiKey (CLI will prompt for your <apiKey>)
twenty auth login

# Init a new application called hello-world
twenty app init hello-world

# Go to your app
cd hello-world

# Add a serverless function to your application
twenty app add serverlessFunction

# Add a trigger to your serverless function
twenty app add trigger

# Add axios to your application
yarn add axios

# Start dev mode: automatically syncs changes to your Twenty workspace, so you can test new functions/objects instantly.
twenty app dev

# Or use one time sync (also generates SDK automatically)
twenty app sync

# List all available commands
twenty help
```

## Application Structure

Each application in this package follows the standard application structure:

```
app-name/
├── package.json
├── README.md
├── serverlessFunctions  # Custom backend logic (runs on demand)
└── ...
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

- see our [Hacktoberfest 2025 notion page](https://twentycrm.notion.site/Hacktoberfest-27711d8417038037a149d4638a9cc510)
- our [Discord](https://discord.gg/cx5n4Jzs57)
