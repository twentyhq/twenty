---
name: setup-mcp
description: Use when the user wants to set up, connect, reconfigure, or troubleshoot the Twenty MCP server for Claude Code or another MCP client, especially when the workspace URL can be a Twenty Cloud subdomain, a custom domain, or a localhost development domain.
---

# Setup MCP

## Overview

Use this skill to configure a workspace-specific Twenty MCP endpoint. The plugin must not assume a fixed workspace domain; collect the user's workspace URL first, normalize it to an MCP URL, then configure and authenticate the MCP client.

## Required User Input

Ask for the workspace URL or host if it is missing. Do not invent or reuse a private default domain.

Accept any of these forms:

```text
myworkspace.twenty.com
myworkspace.customdomain.com
myworkspace.localhost:3001
https://myworkspace.twenty.com
https://myworkspace.customdomain.com/mcp
http://myworkspace.localhost:3001/mcp
```

Optional inputs:

- MCP server name. Default to a workspace-derived name in the form `twenty-<host-without-tld>`, for example `acme.example.com` becomes `twenty-acme-example`.
- Whether to immediately walk the user through OAuth in the current Claude Code session. Default to no; Claude Code starts OAuth on first connect when the user runs `/mcp` and selects the server.

Important OAuth guard:

- Do not manually open an OAuth URL printed by `claude mcp add` unless the user confirms no browser tab opened. Opening the same authorization URL twice creates two callback tabs with the same `state` and different one-time `code` values.

## URL Normalization

Normalize workspace input as follows:

- If the input already starts with `http://` or `https://`, preserve that scheme.
- If the input has no scheme and is `localhost`, `127.x.x.x`, `[::1]`, `*.localhost`, or `*.localhost:<port>`, use `http://`.
- If the input has no scheme and is any other host, use `https://`.
- If the final URL does not end with `/mcp`, append `/mcp`.

Examples:

```text
myworkspace.twenty.com       -> https://myworkspace.twenty.com/mcp       name: twenty-myworkspace
acme.example.com             -> https://acme.example.com/mcp             name: twenty-acme-example
myworkspace.customdomain.com -> https://myworkspace.customdomain.com/mcp name: twenty-myworkspace-customdomain
myworkspace.localhost:3001   -> http://myworkspace.localhost:3001/mcp   name: twenty-myworkspace-localhost-3001
```

## Setup Workflow

Use the bundled helper from the Twenty repo or plugin checkout:

```bash
bash packages/twenty-claude-code-plugin/scripts/setup-mcp.sh <workspace-url-or-mcp-url>
```

Use `--name <server-name>` when configuring multiple Twenty workspaces:

```bash
bash packages/twenty-claude-code-plugin/scripts/setup-mcp.sh --name twenty-prod acme.twenty.com
bash packages/twenty-claude-code-plugin/scripts/setup-mcp.sh --name twenty-local acme.localhost:3001
```

Use `--print-url` to preview normalization without changing client config:

```bash
bash packages/twenty-claude-code-plugin/scripts/setup-mcp.sh --print-url myworkspace.localhost:3001
```

The helper:

- Normalizes the URL.
- Derives a workspace-specific default MCP server name unless `--name` is provided.
- Replaces any existing MCP server with the same name.
- Runs `claude mcp add --transport http <name> <normalized-url>`.
- Tells the user to run `/mcp` inside Claude Code to start OAuth for the new server.

## Manual Fallback

If the helper is unavailable, configure Claude Code manually:

```bash
claude mcp add --transport http twenty-myworkspace https://myworkspace.twenty.com/mcp
```

For local development:

```bash
claude mcp add --transport http twenty-local http://myworkspace.localhost:3001/mcp
```

After adding, open Claude Code and run `/mcp` to launch the OAuth flow for the new server. Tokens are stored securely and refreshed automatically.

## Validation

After setup, verify the MCP server is available:

```bash
claude mcp get <server-name>
claude mcp list
```

Inside Claude Code, run `/mcp` to confirm the server is connected and reachable.

When connected, use the Twenty MCP discovery flow:

```text
get_tool_catalog -> learn_tools -> execute_tool
```

## Troubleshooting

### Debugging Workflow

Use this workflow when the user reports missing tools, unexpected workspace data, authentication failures, or suspects Claude Code queried the wrong Twenty workspace.

1. Identify the intended workspace URL or host from the user's request, using Required User Input when it is missing.
2. Normalize the intended workspace to its MCP URL:

```bash
bash packages/twenty-claude-code-plugin/scripts/setup-mcp.sh --print-url <workspace-url-or-mcp-url>
```

3. Inspect configured Twenty MCP servers and compare their URLs to the intended normalized URL:

```bash
claude mcp list
claude mcp get <server-name>
```

4. If no configured server points to the intended MCP URL, configure one with a workspace-specific name:

```bash
bash packages/twenty-claude-code-plugin/scripts/setup-mcp.sh --name <server-name> <workspace-url-or-mcp-url>
```

5. If the server exists but authentication is missing or `/mcp` reports `Auth required`, run `/mcp` inside Claude Code, select the server, and complete the browser OAuth flow.
6. If the configured server is correct and authenticated but its tools are not visible in the current Claude Code session, the session may have loaded tools before the server was added or authenticated. Restart Claude Code or start a new session so it picks up the updated MCP config.
7. Before querying workspace data, confirm the callable Twenty MCP namespace or tool name corresponds to the intended server. If only a different Twenty server is callable, do not use it as a fallback unless the user explicitly asks.
8. When reporting results, state which workspace URL or MCP server was used if there was any ambiguity.

### Common Failure Modes

- If OAuth fails for a self-hosted workspace, check that `SERVER_URL` matches the public workspace origin. OAuth metadata and MCP URLs derive from that value.
- If a local workspace fails over HTTPS, use `http://` explicitly or rely on the helper's localhost default.
- If the server name already exists, the helper replaces that MCP entry with the new URL. Use a custom `--name` to keep multiple workspaces.

### Safety Rules

- Do not put API keys in plugin files. Prefer OAuth login. If an MCP client does not support OAuth, configure bearer headers only in the user's private MCP client config.
- Do not inspect or manually extract OAuth tokens as a workaround.
