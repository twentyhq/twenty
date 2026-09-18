# Agent Skills in this repository

This repository contains several families of Agent Skills. They have different audiences, so pick the one that matches what you are doing. Only the first family is meant to be installed by people building on Twenty.

## Building a Twenty app — install these

[`packages/twenty-agent-skills`](./packages/twenty-agent-skills) is the official, harness-agnostic collection for creating, developing, operating, and publishing Twenty apps. It works in Claude Code, Codex, Cursor, Pi, and any other harness supported by the `skills` CLI, against any Twenty instance including self-hosted and localhost.

```bash
npx skills add https://github.com/twentyhq/twenty/tree/agent-skills --list
npx skills add https://github.com/twentyhq/twenty/tree/agent-skills --skill create-app
```

Install from the `agent-skills` branch, which contains only the built app skills and Codex plugin. The source package on `main` keeps references shared and must be built before installation. The branch becomes available after the first successful publish from `main`; until then, use the [local build instructions](./packages/twenty-agent-skills#local-development).

| Skill            | Use it for                                                                            |
| ---------------- | ------------------------------------------------------------------------------------- |
| `create-app`     | Scaffold a new Twenty app.                                                            |
| `develop-app`    | Add or modify objects, fields, logic functions, layouts, front components, workflows. |
| `manage-app`     | Remotes, sync, build, deploy, logs, troubleshooting, CI/CD.                           |
| `publish-app`    | README, marketplace metadata, logos, screenshots, public assets.                      |
| `use-twenty-mcp` | Optional: connect an agent to a workspace over MCP and present records readably.      |

## Working inside a Twenty workspace

[`packages/twenty-claude-skills`](./packages/twenty-claude-skills) holds skills for using a Twenty workspace rather than building on it, such as presenting CRM records as readable summaries.

## Contributing to Twenty itself

[`.claude/skills`](./.claude/skills) holds the skills for agents and contributors working in this checkout: `qa-scout` for browser QA of a pull request, and the `syncable-entity-*` series covering Twenty's own workspace migration system. They assume a checkout of this repository and are not useful for app development, which the `syncable-entity-*` descriptions state in their first sentence.

These are what a bare-repository listing (`npx skills add twentyhq/twenty --list`) returns. Use the `agent-skills` branch above for app development.

## Shipped inside apps

`packages/twenty-apps/**/src/skills` holds skills that a specific Twenty app ships to its users. They are part of that app, not of this collection.

## Codex plugin

[`packages/twenty-agent-skills`](./packages/twenty-agent-skills) owns both the canonical skills and the Codex metadata. Its build produces one distribution, published at the root of the `agent-skills` branch, for the `skills` CLI and the Codex plugin named `twenty`. Generated copies are not committed to `main`.
