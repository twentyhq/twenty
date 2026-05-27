---
name: develop-app
description: Use when the user wants to add or modify Twenty app entities, including objects, layouts, logic functions, and front components inside an existing Twenty app.
---

# Boundaries

For background on how Twenty apps work — the SDK packages, remotes, sync lifecycle, and rendering model — read `../../references/concepts/how-apps-work.md`.

Do not scaffold a new app here. Use `create-app` first when the app does not exist.

# Workflow

First, confirm the setup is sane before changing entities. The current directory should be the root of an existing Twenty app:

```bash
test -f package.json
test -f src/application-config.ts
```

If either file is missing, do not edit blindly. Inspect nearby folders to find the app root, or use `create-app` when the app does not exist.

If setup, dependencies, remotes, authentication, sync, build, deploy, logs, or CI/CD are failing, switch to `manage-app` before continuing with entity work.

For app shape and entity file structure, read `../../references/develop-app/app-structure.md`.

## Adding New Entities

Use the app CLI to add new entities. It generates the correct file structure, UUIDs, SDK imports, and boilerplate automatically:

```bash
yarn twenty dev:add
```

This is the default and preferred way to create objects, fields, views, logic functions, front components, and other entities. Do not manually create entity files, explore SDK typings in `node_modules`, or generate UUIDs by hand when the CLI can do it.

Only create entity files manually when modifying existing entities or when the CLI does not support the specific entity type.

## After Entity Changes

After adding or modifying entities, sync the app to the active remote:

```bash
yarn twenty dev --once
```

Do not run `yarn twenty dev:typecheck`, `yarn lint`, or other validation commands. These are redundant when the CLI generated the files, and they cause environment issues in the Codex sandbox. The sync command itself will report errors if the entity definitions are invalid.

Do not attempt to fix Node or Yarn version mismatches, search for version managers, or debug the toolchain. If a command fails due to environment issues, report the error to the user and stop.

Use the official Twenty docs or local SDK source when exact entity fields, imports, or configuration shapes matter.

# Develop References

Read the smallest reference that matches the requested entity work:

- Objects, fields, relations, roles, and permissions: `../../references/develop-app/data-model.md`
- Views, navigation, page layouts, page layout tabs, and front component registration: `../../references/develop-app/layout.md`
- Full-page custom UI and standalone page patterns: `../../references/develop-app/standalone-pages.md`
- Front component source, Twenty UI imports, data hooks, runtime imports, and browser verification: `../../references/develop-app/front-components.md`
- Logic functions, skills, agents, and connection providers: `../../references/develop-app/logic.md`
- App file structure and entity validation checklist: `../../references/develop-app/app-structure.md`
- Detailed front component UI design: `../../references/design/front-component-ui.md`

For front components, read `front-components.md` before implementation. Use `layout.md` for placement, `standalone-pages.md` for full-page custom UI, and `front-component-ui.md` for visual design and Twenty UI component selection.

# Handoffs

Use `../../references/design/front-component-ui.md` when the entity work turns into front component UI design.

Use `publish-app` when the task turns into README, marketplace copy, screenshots, logos, or listing assets.
