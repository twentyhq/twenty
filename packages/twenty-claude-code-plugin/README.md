# Twenty Claude Code Plugin

This plugin packages the official Twenty app creation workflow, Twenty documentation MCP server, and Twenty workspace MCP connection for [Claude Code](https://docs.claude.com/en/docs/claude-code/overview).

This workspace package is the source of the repo-local Claude Code plugin. The repo-local marketplace entry at `.claude-plugin/marketplace.json` points directly to this package.

## Included Skills

- `create-an-app`: scaffold, run, and troubleshoot a Twenty app with `create-twenty-app`.
- `setup-mcp`: collect a workspace URL, normalize the MCP endpoint, configure Claude Code, and guide OAuth login.
- `app-readme-and-visuals`: prepare a Twenty app README, marketplace metadata, logo, screenshots, and public visual assets.
- `dev-server`: start, restart, reset, and troubleshoot the local Twenty contributor dev stack.
- `retrieve-and-present-data`: turn raw Twenty MCP output into readable Markdown summaries with record links.

## Included Slash Commands

- `/twenty-create-app` — scaffold a new Twenty app.
- `/twenty-setup-mcp` — configure the Twenty MCP server for a workspace.
- `/twenty-dev-server` — start or troubleshoot the local Twenty contributor dev stack.
- `/twenty-app-readme` — prepare README, marketplace metadata, and visuals.
- `/twenty-records` — retrieve and present Twenty records as readable Markdown.

## Included MCP Servers

- `twenty-docs`: public Twenty documentation MCP at `https://docs.twenty.com/mcp`.

## MCP Setup

The plugin ships only the public Twenty documentation MCP URL. Marketplace users should use the `setup-mcp` skill, the `/twenty-setup-mcp` slash command, or the helper script to configure their own Twenty workspace endpoint in their private Claude Code MCP config.

Do not add workspace-specific MCP URLs to this package. Workspace MCP URLs are user-specific and belong in the local Claude Code MCP configuration created by the setup helper.

## Quick MCP Setup

Use the CLI helper when configuring MCP from a terminal:

```bash
bash packages/twenty-claude-code-plugin/scripts/setup-mcp.sh myworkspace.twenty.com
```

By default, the helper names the server after the workspace host, such as `twenty-myworkspace` or `twenty-acme-example`. After the server is added, open Claude Code and run `/mcp` to start OAuth.

Equivalent manual CLI setup:

```bash
claude mcp add --transport http twenty-myworkspace https://myworkspace.twenty.com/mcp
```

Then run `/mcp` inside Claude Code to authenticate.

Supported workspace forms:

```text
myworkspace.twenty.com       -> https://myworkspace.twenty.com/mcp       name: twenty-myworkspace
acme.example.com             -> https://acme.example.com/mcp             name: twenty-acme-example
myworkspace.customdomain.com -> https://myworkspace.customdomain.com/mcp name: twenty-myworkspace-customdomain
myworkspace.localhost:3001   -> http://myworkspace.localhost:3001/mcp   name: twenty-myworkspace-localhost-3001
```

## Local Testing

Test the plugin locally from a clone of the Twenty repo:

```bash
claude plugin marketplace add ./.claude-plugin
claude plugin install twenty@twenty-pbc
```

Or, inside an active Claude Code session:

```text
/plugin marketplace add ./.claude-plugin
/plugin install twenty@twenty-pbc
```

Run validation before publishing:

```bash
node packages/twenty-claude-code-plugin/scripts/validate.js
```
