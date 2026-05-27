---
name: create-app
description: Use when the user wants to create or scaffold a new Twenty app
---

# Quickstart an App

Use this as the default way to start an app unless the user gives different instructions.

First, ask the user for the app name if they did not provide one.

The directory name must contain only lowercase letters, numbers, and hyphens. Transform the entered name to lowercase and replace spaces with hyphens when needed.

```bash
npx create-twenty-app@latest <app-name>
cd <app-name>
yarn twenty dev --once
```

The scaffolder creates the project, enables corepack, installs dependencies, initializes Git, starts a local Twenty server through Docker, authenticates with the development API key, runs an initial one-shot sync, and opens the generated app page when possible.

After the scaffolder completes successfully, run a one-shot sync to confirm the app is deployed:

```bash
cd <app-name>
yarn twenty dev --once
```

Always use `--once` to synchronize the app. Do not use bare `yarn twenty dev` (watch mode). Run `yarn twenty dev --once` each time you need to sync changes to the active remote.

If the user provides a package name, display name, or description, pass them through:

```bash
npx create-twenty-app@latest <app-directory> --name "<package-name>" --display-name "<display-name>" --description "<description>"
```

Supported create-time options are `--name`, `--display-name`, `--description`, `--url`, and `--authentication-method`.

The default local Twenty URL is `http://localhost:2020/`

# Docker Troubleshooting

Use this when the default local flow fails because Docker is missing or not running.

If Docker is missing, share this download link: `https://www.docker.com/products/docker-desktop/`. Ask the user to install Docker Desktop.

# Next Steps

Use `develop-app` when the user wants to add objects, fields, logic functions, roles, views, navigation, page layouts, skills, agents, or front component registrations.

Use `references/design/front-component-ui.md` when the user wants to design or improve the UI of a Twenty front component.
