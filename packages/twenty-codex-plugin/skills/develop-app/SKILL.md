---
name: develop-app
description: Use when the user wants to add or modify Twenty app entities, including objects, layouts, logic functions, and front components inside an existing Twenty app.
---

# When To Use

Pick this skill when the user wants to change what an existing Twenty app *does* — its data model, UI, logic, or workflows. Representative triggers:

- "add a new object to my Twenty app"
- "create a logic function that runs on record create"
- "add a custom field to the company object"
- "build a front component for the deal page"
- "modify an existing entity / object / field"
- "add a workflow with a manual trigger"
- "add roles and permissions to my app"
- "create a standalone page in my app"

Do not use this skill to scaffold a brand-new app (use `create-app`), to sync/deploy/troubleshoot (use `manage-app`), to prepare marketplace assets (use `publish-app`), or to query workspace records (use `use-twenty-mcp`).

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

## Plan Before Editing

For any change involving more than one entity, state the plan back in 3–6 lines before editing: objects extended, fields added, logic functions and post-install hooks declared, whether the app needs UI. Confirm with the user when there is a real choice.

Skip for single-entity edits, renames, and copy fixes.

## Code Organization

Keep logic functions, post-install hooks, and front components narrow. Extract everything that is not the trigger, inputs, writes, rendering shell, or external call:

- `src/utils/<name>.util.ts` — pure helpers (parsers, mappers, formatters).
- `src/front-components/utils/<name>.util.ts` — front-component runtime helpers that are reusable and testable.
- `src/types/<name>.ts` — external API and internal DTO types (one PascalCase type per file).
- `src/<service>-client/<name>.ts` — wrappers around external SDKs or shared HTTP clients. One folder per service, matching Twenty's `*-client` convention.

Kebab-case filenames. One export per file is mandatory for every helper, type, and client file in `src/` — never multiple function exports in one file. The rule counts exports: a local (non-exported) type may stay alongside the util, but once a type is exported or reused it splits into a `src/types/<name>.ts` file separate from the `src/utils/<name>.util.ts` file. See `app-structure.md` for the canonical rule and the full suffix convention.

Refactor when:

- A `*.logic-function.ts` or `*.post-install.ts` file exceeds the soft cap (see `../../references/develop-app/logic.md`).
- A front component contains duplicated command execution, record loading, logic-function lookup, payload building, result parsing, or snackbar formatting.
- The same parsing or mapping logic appears across object types.
- Multiple field files differ only by name and identifier — use a factory under `src/fields/`.

Always create a `*.spec.ts` test file in a sibling `__tests__/` folder for every util/function you add or change, one spec file per source file. See `../../references/develop-app/tests.md`.

When a front component triggers a logic function for selected records, always prefer a bulk-capable logic function unless the user explicitly states that the function is only for one record. The default payload shape is `records: Array<{ id: string; ...fields }>`: inside `records`, use `id` for the Twenty record ID because the array name already establishes the record context. Do not add flat single-record compatibility payloads unless the user explicitly asks to preserve an existing single-record API.

## Adding New Entities

Use the app CLI to add new entities. It generates the correct file structure, UUIDs, SDK imports, and boilerplate automatically:

```bash
yarn twenty dev:add
```

This is the default and preferred way to create objects, fields, views, logic functions, front components, and other entities. Do not manually create entity files, explore SDK typings in `node_modules`, or generate UUIDs by hand when the CLI can do it.

Only create entity files manually when modifying existing entities or when the CLI does not support the specific entity type.

## After Entity Changes

Once all edits for the change are complete, run lint and typecheck once at the end (not after each individual edit), then sync the app to the active remote:

```bash
yarn twenty dev:typecheck
yarn lint
yarn twenty dev --once
```

`yarn twenty dev:typecheck` checks generated app types, `yarn lint` checks local lint rules, and `yarn twenty dev --once` syncs entity definitions to the active remote. Run all three a single time once every edit is done, not repeatedly after each step. When the user explicitly asks to run tests, follow `../../references/develop-app/tests.md`.

Use the official Twenty docs or local SDK source when exact entity fields, imports, or configuration shapes matter.

# Develop References

Read the smallest reference that matches the requested entity work:

- Objects, fields, relations, roles, and permissions: `../../references/develop-app/data-model.md`
- Views, navigation, page layouts, page layout tabs, and front component registration: `../../references/develop-app/layout.md`
- Full-page custom UI and standalone page patterns: `../../references/develop-app/standalone-pages.md`
- Front component source, Twenty UI imports, data hooks, runtime imports, and browser verification: `../../references/develop-app/front-components.md`
- Logic functions, skills, agents, post-install hooks, and connection providers: `../../references/develop-app/logic.md`
- Workflows, manual triggers, draft/activate lifecycle, and seeder pitfalls: `../../references/develop-app/workflows.md`
- Tests — what to cover and where to put the files: `../../references/develop-app/tests.md`
- App file structure and entity validation checklist: `../../references/develop-app/app-structure.md`
- Detailed front component UI design: `../../references/design/front-component-ui.md`

For front components, read `front-components.md` before implementation. Use `layout.md` for placement, `standalone-pages.md` for full-page custom UI, and `front-component-ui.md` for visual design and Twenty UI component selection.

# Handoffs

Use `../../references/design/front-component-ui.md` when the entity work turns into front component UI design.

Use `publish-app` when the task turns into README, marketplace copy, screenshots, logos, or listing assets.
