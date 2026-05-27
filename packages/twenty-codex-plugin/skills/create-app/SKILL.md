---
name: create-app
description: Use when the user wants to create or scaffold a new Twenty app
---

# Quickstart an App

For background on how Twenty apps work — the SDK packages, remotes, sync lifecycle, and rendering model — read `../../references/concepts/how-apps-work.md`.

Use this as the default way to start an app unless the user gives different instructions.

## Why A Twenty Instance Is Needed

Before scaffolding, explain to the user that a Twenty app is not a standalone application — it is a package that extends a running Twenty instance. During development, the app's entities (objects, views, front components, logic functions) are synced to a Twenty instance where they are registered, rendered, and executed. Without a connected instance, there is nothing to sync to, no workspace to test in, and no way to verify the app works.

## Choose A Twenty Instance

Ask the user how they want to connect to a Twenty instance:

1. **Local instance with Docker** — the scaffolder starts a disposable local Twenty server on `http://localhost:2020` through Docker. Best for starting fresh without affecting a shared workspace. Requires Docker Desktop to be installed and running.
2. **Existing Twenty instance** — the user provides the URL of a running Twenty server (self-hosted or cloud, e.g. `https://app.twenty.com`). The scaffolder authenticates via OAuth on that instance. Best when the user already has a workspace with data they want to develop against.

If the user does not specify, ask which option they prefer before proceeding.

## Scaffolding

First, ask the user for the app name if they did not provide one.

The directory name must contain only lowercase letters, numbers, and hyphens. Transform the entered name to lowercase and replace spaces with hyphens when needed.

For a local Docker instance (default):

```bash
npx create-twenty-app@latest <app-name>
```

For an existing Twenty instance:

```bash
npx create-twenty-app@latest <app-name> --url <twenty-instance-url>
```

The `--url` flag skips Docker setup and authenticates via OAuth on the provided instance. The scaffolder opens a browser for the OAuth flow, then stores the credentials as a remote in `~/.twenty/config.json`.

The scaffolder handles everything: it creates the project, enables corepack, installs dependencies, initializes Git, authenticates with the target instance, runs an initial sync, and opens the generated app page when possible.

Do not run `yarn twenty dev --once` after scaffolding. The scaffolder already performs the initial sync. Running it again is redundant and will fail if the Codex environment has a different Node or Yarn version than the project expects.

After the scaffolder completes, `cd` into the project directory and confirm the files are in place. The app is already synced and installed on the target instance.

If the user provides a package name, display name, or description, pass them through:

```bash
npx create-twenty-app@latest <app-directory> --name "<package-name>" --display-name "<display-name>" --description "<description>"
```

Supported create-time options are `--name`, `--display-name`, `--description`, `--url`, and `--authentication-method`.

When the user later makes changes to the app entities, use `yarn twenty dev --once` to sync those changes. See the `manage-app` skill for sync workflow.

## Docker Troubleshooting

Use this when the local Docker flow fails because Docker is missing or not running.

If Docker is missing, share this download link: `https://www.docker.com/products/docker-desktop/`. Ask the user to install Docker Desktop.

If Docker is not an option, suggest connecting to an existing Twenty instance instead using the `--url` flag.

# Next Steps

Use `develop-app` when the user wants to add objects, fields, logic functions, roles, views, navigation, page layouts, skills, agents, or front component registrations.

Use `references/design/front-component-ui.md` when the user wants to design or improve the UI of a Twenty front component.
