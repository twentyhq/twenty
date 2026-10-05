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

| User intent                                                                | Skill            |
| -------------------------------------------------------------------------- | ---------------- |
| Scaffold a brand-new Twenty app                                            | `create-app`     |
| Add or modify objects, fields, logic, views, front components, workflows   | `develop-app`    |
| Manage remotes, sync, build, deploy, logs, troubleshoot, CI/CD             | `manage-app`     |
| Prepare README, marketplace metadata, logos, screenshots for publishing    | `publish-app`    |
| Connect to a workspace via MCP, retrieve records, format readable Markdown | `use-twenty-mcp` |

If the user's request straddles two skills, do the boundary task in the first skill and explicitly hand off to the second. Never silently combine.

## Durable Operating Rules

The cross-skill rules live in `references/concepts/operating-rules.md`. That file is the single source of truth: the build includes it in the shared distribution and the individual skill bundles, so all installations use the same authored rules. Read it before any non-trivial task, and do not restate or fork it here.

Codex-specific additions on top of those rules:

- Workspace MCP endpoints belong in the user's local `.mcp.json` and Codex MCP config. This plugin only ships the public `twenty-docs` MCP server. Use `scripts/setup-mcp.sh` to configure a workspace MCP endpoint for a specific user.

## Reference Doc Map

When a skill points at a reference, read only what the task needs:

- `concepts/how-apps-work.md` — foundational. Read at the start of any non-trivial task.
- `concepts/operating-rules.md` — the durable cross-skill rules. Authoritative; nothing restates them.
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

When editing the source package, run `npx nx run twenty-agent-skills:validate` and `npx nx run twenty-agent-skills:build` after changes. Every box in `CHECKLIST.md` must be satisfied before a release.

## Boundaries

This file is for _agents using the plugin_. If you are _editing the plugin itself_, see [`CONTRIBUTING.md`](https://github.com/twentyhq/twenty/blob/main/packages/twenty-agent-skills/CONTRIBUTING.md).
