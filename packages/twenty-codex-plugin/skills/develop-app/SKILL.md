---
name: develop-app
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

Do not scaffold a new app here. Use `create-app` first when the app does not exist.

Do not provide detailed visual design guidance for front components. Use `references/design/front-component-ui.md` for UI layout, styling, states, and polish.

# Workflow

First, confirm the current directory is a Twenty app:

```bash
test -f package.json
test -f src/application-config.ts
```

If the app is missing, use `create-app`.

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

Use `references/design/front-component-ui.md` when the entity work turns into front component UI design.

Use `publish-app` when the task turns into README, marketplace copy, screenshots, logos, or listing assets.
