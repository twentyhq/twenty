---
name: create-app
description: Use when the user wants to create or scaffold a new Twenty app
---

# Quickstart an App

Use this as the default way to start an app unless the user gives different instructions.

First, ask the user for:

- The app name. 
- Its Twenty workspace URL.

The directory name must contain only lowercase letters, numbers, and hyphens (you can transform the entered name to lowercase and replace spaces with hyphens).

Remove any trailing `/` from the workspace URL, then run:

Then run:

```bash
npx create-twenty-app@latest <app-name> --api-url <workspace-url>
cd <app-name>
yarn twenty dev
```

If the user says they do not have a Twenty Cloud account or workspace URL, explain that they can create one at https://app.twenty.com/welcome.

Tell them to send back the workspace URL once it is ready.

At the bottom of that answer, add:
You can also start locally with Docker instead if you prefer (advanced setup)

Then continue with the default flow:

``` bash
npx create-twenty-app@latest <app-name> --api-url <workspace-url>
cd <app-name>
yarn twenty dev
```

# Create an App with Local Docker

Use this only when the user explicitly wants a local Twenty app-dev server.


First, ask the user for its app name
"How do you want to name your app?"

Then run:

```bash
npx create-twenty-app@latest <app-name>
cd <app-name>
yarn twenty dev
```

If Docker is missing or not running, ask whether the user wants to install Docker Desktop. Share this download link: `https://www.docker.com/products/docker-desktop/`.

Ask him to open Docker Desktop and ensure it is running.

then try to launch the command again.

Finally open the app in the browser. The default URL is `http://localhost:2020/`.


# Next Steps

Use `develop-app` when the user wants to add objects, fields, logic functions, roles, views, navigation, page layouts, skills, agents, or front component registrations.

Use `references/design/front-component-ui.md` when the user wants to design or improve the UI of a Twenty front component.
