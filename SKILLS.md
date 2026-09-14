# Agent Skills in this repository

This repository contains several families of Agent Skills. They have different audiences, so pick the one that matches what you are doing. Only the first family is meant to be installed by people building on Twenty.

## Building a Twenty app — install these

[`packages/twenty-agent-skills`](./packages/twenty-agent-skills) is the official, harness-agnostic collection for creating, developing, operating, and publishing Twenty apps. It works in Claude Code, Codex, Cursor, Pi, and any other harness supported by the `skills` CLI, against any Twenty instance including self-hosted and localhost.

```bash
npx skills add twentyhq/twenty/packages/twenty-agent-skills --list
npx skills add twentyhq/twenty/packages/twenty-agent-skills --skill create-app
```

Always pass the package path. Pointing the CLI at the bare repository discovers every skill below as well, which is rarely what you want.

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

[`.cursor/skills`](./.cursor/skills) holds internal skills for contributors changing Twenty's own server code, such as the `syncable-entity-*` series covering the workspace migration system. They assume a checkout of this repository and are not useful for app development.

## Shipped inside apps

`packages/twenty-apps/**/src/skills` holds skills that a specific Twenty app ships to its users. They are part of that app, not of this collection.

## Codex plugin

[`packages/twenty-codex-plugin`](./packages/twenty-codex-plugin) is the Codex marketplace wrapper around the app-development skills. It is the canonical source: `packages/twenty-agent-skills` is generated from it, so both distributions always carry the same content.
