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
yarn twenty dev
```

The scaffolder creates the project, installs dependencies, initializes Git, starts a local Twenty server through Docker, authenticates with the development API key, runs an initial one-shot sync, and opens the generated app page when possible.

If the user provides a package name, display name, or description, pass them through:

```bash
npx create-twenty-app@latest <app-directory> --name "<package-name>" --display-name "<display-name>" --description "<description>"
```

Supported create-time options are `--name`, `--display-name`, `--description`, `--url`, and `--authentication-method`.

# Create an App Against an Existing Server

Use this only when the user explicitly wants to connect the new app to an existing Twenty Cloud, self-hosted, or remote development server.

First, ask the user for:

- The app name.
- The Twenty server or workspace URL.

Remove any trailing `/` from the server URL, then run:

```bash
npx create-twenty-app@latest <app-name> --url <server-url>
cd <app-name>
yarn twenty dev
```

For remote URLs, the scaffolder uses OAuth authentication by default. Do not use `--api-url`; it is deprecated. Do not pass `--authentication-method apiKey` for remote servers because create-time API key authentication is only supported for the local Docker instance.

# Docker Troubleshooting

Use this when the default local flow fails because Docker is missing or not running.

If scaffolding fails before project creation, check the runtime first: `create-twenty-app@2.7.0` declares Node.js `^24.5.0` and Yarn `^4.0.2`. Use `corepack enable` when Yarn is missing.

If Docker is missing, share this download link: `https://www.docker.com/products/docker-desktop/`. Ask the user to install Docker Desktop, open it, and ensure it is running before retrying the scaffold command.

If Docker is installed but not running, the app may already have been created without server authentication or sync. Ask the user to open Docker Desktop, then resume from the generated app directory:

```bash
cd <app-name>
yarn twenty docker:start
yarn twenty remote:add --local
yarn twenty dev --once
yarn twenty dev
```

The default local Twenty URL is `http://localhost:2020/`.


# Next Steps

Use `develop-app` when the user wants to add objects, fields, logic functions, roles, views, navigation, page layouts, skills, agents, or front component registrations.

Use `references/design/front-component-ui.md` when the user wants to design or improve the UI of a Twenty front component.
