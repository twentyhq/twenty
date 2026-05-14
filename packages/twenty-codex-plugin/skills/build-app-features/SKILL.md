---
name: build-app-features
description: Use when the user wants to add or modify Twenty app entities inside an existing Twenty app.
---

# When to Use

Use this when the user wants to add or modify app entities in an existing Twenty app:

- Objects and fields.
- Roles and permissions.
- Logic functions.
- Views, navigation, page layouts, and page layout tabs.
- Skills, agents, and connection providers.
- Front component registration.

# Boundaries

Do not scaffold a new app here. Use `create-an-app` first when the app does not exist.

Do not provide detailed visual design guidance for front components. Use `design-front-components` for UI layout, styling, states, and polish.

# Workflow

First, confirm the current directory is a Twenty app:

```bash
test -f package.json
test -f src/application-config.ts
```

If the app is missing, use `create-an-app`.

Prefer the app CLI for new entities:

```bash
yarn twenty add
```

After changes, run:

```bash
yarn twenty dev
```

Use the official Twenty docs or local SDK source when exact entity fields, imports, or configuration shapes matter.

# Handoffs

Use `design-front-components` when the entity work turns into front component UI design.

Use `app-readme-and-visuals` when the task turns into README, marketplace copy, screenshots, logos, or listing assets.
