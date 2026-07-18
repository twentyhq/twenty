# Twenty Agent Skills

Official, harness-agnostic [Agent Skills](https://skills.sh/) for building Twenty apps. Works with every harness supported by the `skills` CLI: Claude Code, Codex, Cursor, GitHub Copilot, Windsurf, OpenCode, and others.

Each skill directory is fully self-contained: installing a single skill also installs every reference doc and cross-skill operating rule it needs, with no broken relative links.

## Installation

List the available skills:

```bash
npx skills add https://github.com/twentyhq/twenty/tree/main/packages/twenty-agent-skills --list
```

Install a single skill:

```bash
npx skills add https://github.com/twentyhq/twenty/tree/main/packages/twenty-agent-skills --skill create-app
npx skills add https://github.com/twentyhq/twenty/tree/main/packages/twenty-agent-skills --skill develop-app
```

Install everything:

```bash
npx skills add https://github.com/twentyhq/twenty/tree/main/packages/twenty-agent-skills --skill '*'
```

The `skills` CLI prompts for the target agents, or accepts them directly with `--agent` (for example `--agent claude-code`, `--agent codex`, `--agent cursor`, or `--agent '*'`).

## Skills

| Skill                                                | Use it for                                                                                          |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`create-app`](./skills/create-app/SKILL.md)         | Scaffold a new Twenty app with `create-twenty-app`.                                                 |
| [`develop-app`](./skills/develop-app/SKILL.md)       | Add or modify objects, fields, logic functions, layouts, front components, workflows.               |
| [`manage-app`](./skills/manage-app/SKILL.md)         | Manage remotes, sync, build, deploy, logs, troubleshooting, CI/CD.                                  |
| [`publish-app`](./skills/publish-app/SKILL.md)       | Prepare README, marketplace metadata, logos, screenshots, public assets.                            |
| [`use-twenty-mcp`](./skills/use-twenty-mcp/SKILL.md) | Optional: connect the agent to a Twenty workspace via MCP and present records as readable Markdown. |

The four app-development skills work without any MCP setup. `use-twenty-mcp` is an optional addition for querying workspace data.

## Self-Hosted Instances

Self-hosted instances are first-class targets. The skills never require a `twenty.com` workspace: any Twenty instance URL works, including custom HTTPS domains and localhost HTTP URLs. Workspace URLs and credentials are always supplied by the user and stay user-local.

## Canonical Source

The content of `skills/` is generated from the canonical skill content in [`packages/twenty-codex-plugin`](../twenty-codex-plugin), which also powers the Codex marketplace plugin. Do not edit `skills/` directly.

To change a skill or reference doc:

1. Edit the canonical content in `packages/twenty-codex-plugin/skills/` or `packages/twenty-codex-plugin/references/`.
2. Regenerate this package: `npx nx run twenty-agent-skills:build`.
3. Commit the regenerated `skills/` output.

CI fails when `skills/` is out of sync with the canonical content.

### Commands

```bash
# Regenerate skills/ from the canonical source
npx nx run twenty-agent-skills:build

# Check sync + validate frontmatter, self-containment, and portability
npx nx run twenty-agent-skills:validate

# Run unit tests for the build and validation scripts
npx nx run twenty-agent-skills:test
```
