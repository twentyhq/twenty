# Twenty Codex Plugin — Agent Guidance

This file is the canonical entry point for any agent (Codex, ChatGPT Developer Mode, or compatible) running with the Twenty plugin loaded. It encodes the boundaries, conventions, and operating rules that apply across all five bundled skills.

Per-skill SKILL.md files own task-specific guidance. This file owns the cross-skill expectations.

## What This Plugin Does

The Twenty Codex plugin helps users build, operate, develop, publish, and query Twenty apps — modular extensions for the Twenty CRM platform. It bundles:

- **5 skills** for the canonical Twenty app workflows.
- **15 reference docs** under `references/` covering concepts, data model, UI, layouts, CLI, publishing, and MCP.
- **1 public MCP server** (`twenty-docs`) for searching official Twenty documentation.
- **1 setup helper** (`scripts/setup-mcp.sh`) for adding user-local workspace MCP endpoints.

A Twenty app is a standalone npm package that extends a running Twenty instance. It is not a standalone application. For the full mental model read `references/concepts/how-apps-work.md` before doing anything substantive.

## Skill Routing

Pick exactly one skill at a time based on the user's intent. Skills are deliberately disjoint.

| User intent | Skill |
|---|---|
| Scaffold a brand-new Twenty app | `create-app` |
| Add or modify objects, fields, logic, views, front components, workflows | `develop-app` |
| Manage remotes, sync, build, deploy, logs, troubleshoot, CI/CD | `manage-app` |
| Prepare README, marketplace metadata, logos, screenshots for publishing | `publish-app` |
| Connect to a workspace via MCP, retrieve records, format readable Markdown | `use-twenty-mcp` |

If the user's request straddles two skills, do the boundary task in the first skill and explicitly hand off to the second. Never silently combine.

## Durable Operating Rules

These rules apply in every skill. They exist because they have failed before.

1. **One-shot sync only.** Use `yarn twenty dev --once` to synchronize app changes. Never `yarn twenty dev` (watch mode). Watch mode leaks file handles and produces ambiguous failure output in agent sandboxes.

2. **Do not run broad validation unless it is requested.** After scaffolding (`create-twenty-app`) or after the CLI generates entities, prefer the bounded command that matches the task: `yarn twenty dev --once` for app sync, the package's unit-test script for unit tests, and `TWENTY_API_URL=http://localhost:2021 yarn test` for the full integration suite. Integration tests must target the isolated test instance on port `2021`, not the dev instance on port `2020`, unless the user explicitly asks otherwise.

3. **Use `yarn twenty dev:add` for new entities.** It generates correct file structure, UUIDs, SDK imports, and boilerplate. Do not hand-craft entity files unless modifying existing ones or the CLI does not support that entity type.

4. **Confirm destructive operations.** Deploys to production, uninstalls, production remote changes, and production syncs require explicit user confirmation before execution. Treat `--remote production` as user-visible.

5. **Never bundle workspace-specific MCP URLs.** Workspace MCP endpoints belong in the user's local `.mcp.json` and Codex MCP config. The plugin only ships the public `twenty-docs` MCP server. Use `scripts/setup-mcp.sh` to configure workspace MCP for a specific user.

6. **Never put credentials in source.** Bearer tokens, API keys, OAuth secrets, and workspace-specific URLs are user-local. `TWENTY_DEPLOY_API_KEY` and similar live in CI secret stores, never committed.

## Reference Doc Map

When a skill points at a reference, read only what the task needs:

- `concepts/how-apps-work.md` — foundational. Read at the start of any non-trivial task.
- `develop-app/app-structure.md` — file layout, entity creation, validation checklist.
- `develop-app/data-model.md` — objects, fields, relations, roles, permissions.
- `develop-app/front-components.md` — front component source, SDK imports, runtime verification.
- `develop-app/layout.md` — views, navigation, page layouts, front component placement.
- `develop-app/standalone-pages.md` — full-page custom UI through standalone page layouts.
- `develop-app/logic.md` — logic functions, skills, agents, post-install, connection providers.
- `develop-app/workflows.md` — workflows, manual triggers, draft/activate lifecycle.
- `develop-app/tests.md` — test organization (`*.spec.ts` in `__tests__/`).
- `design/front-component-ui.md` — Twenty UI defaults and visual design rules.
- `manage-app/cli-and-sync.md` — CLI command semantics, sync modes, build, deploy, logs, CI/CD.
- `publish-app/prepare-for-app-store.md` — README, marketplace metadata, logos, screenshots.
- `use-twenty-mcp/setup.md` — workspace MCP URL normalization and OAuth setup.
- `use-twenty-mcp/result-formatting.md` — record link building, date formatting, readable Markdown.

## How to Verify You're Following Best Practices

Run `yarn workspace twenty-codex-plugin validate` after any change to this plugin. Every box in `CHECKLIST.md` must be satisfied before a release.

## Boundaries

This file is for *agents using the plugin*. If you are *editing the plugin itself*, see `CONTRIBUTING.md`.
