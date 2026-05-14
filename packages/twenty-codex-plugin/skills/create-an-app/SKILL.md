---
name: create-an-app
description: Use when the user wants to create or scaffold a new Twenty app with create-twenty-app.
---

# When to Use

Use this when the user asks to create or scaffold a new Twenty app.

# Quickstart an App

Use this as the default way to start an app unless the user gives different instructions.

First, ask the user for:

- The app name.
- The workspace URL.

After they answer, run:

```bash
npx create-twenty-app@latest <app-name> --api-url <workspace-url>
cd <app-name>
yarn twenty dev
```

Directory names passed to `create-twenty-app` must contain only lowercase letters, numbers, and hyphens.

# Create an App with Local Docker

Use this only when the user wants to create an app against a local Twenty instance.

First, check whether Docker is installed and running:

```bash
docker --version
docker info
```

If Docker is missing or not running, ask whether the user wants to install Docker Desktop. Share this download link: `https://www.docker.com/products/docker-desktop/`.

Then run:

```bash
npx create-twenty-app@latest <app-name>
cd <app-name>
yarn twenty dev
```

# Next Steps

Use `build-app-features` when the user wants to add objects, fields, logic functions, roles, views, navigation, page layouts, skills, agents, or front component registrations.

Use `design-front-components` when the user wants to design or improve the UI of a Twenty front component.
