---
name: create-app
description: Use when the user wants to create or scaffold a new Twenty app
---

# When To Use

Use for requests such as "create a Twenty app" or "scaffold a new app".

# Create an app

Use this skill for a new app. For an existing app, use `develop-app` or `manage-app`.

Read `../../references/concepts/how-apps-work.md` and `../../references/concepts/operating-rules.md` first.

Confirm the app's name and purpose. Use the standalone CLI:

```bash
npm install -g twenty
twenty app init <app-name>
cd <app-name>
yarn install
```

`app init` only writes files. It does not install dependencies, initialize Git, start Docker, authenticate, or perform an initial sync.

Use `--path <directory>` for a different destination and `--display-name` or `--description` for metadata. The positional name is the package name.

Twenty Cloud and self-hosted instances are supported. Ask for the existing Twenty workspace URL when connection is needed. If the user wants a local server, use the documented Docker or repository development environment.

```bash
twenty auth login --url <twenty-instance-url> --name dev
twenty app apply --create --remote dev
```

Only claim the app is installed after apply succeeds. If the request is just scaffolding, stop after the files and dependencies are created. Do not run broad validation unless requested. For integration tests, use the isolated test instance described in `../../references/develop-app/tests.md`.

The template includes a main page, its layout and navigation item, and a health-check function. Remove the placeholder page with its layout and navigation if the app needs no UI. Extend the existing health check rather than declaring a second one.

After creation, use `develop-app` for entities and UI, `manage-app` for bounded sync with `twenty app apply`, and `publish-app` for release work.
