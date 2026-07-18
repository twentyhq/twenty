# Set Up Twenty MCP

## Overview

Use this reference to configure a workspace-specific Twenty MCP endpoint. The skill must not assume a fixed workspace domain; collect the user's workspace URL first, normalize it to an MCP URL, then configure and authenticate the MCP client of the agent in use.

Self-hosted instances are first-class targets. Any Twenty workspace works: managed cloud, self-hosted on a custom domain, or a local instance over HTTP. Never require a `twenty.com` workspace.

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
- Whether to force CLI OAuth login immediately. Default to no when the agent can open OAuth automatically after the MCP server is added. Only force login if the automatic OAuth window does not appear.

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

## Setup Per Agent

Configure the MCP server with the agent the user is running. The Twenty MCP server uses streamable HTTP transport with OAuth authentication.

### Codex

```bash
codex mcp add twenty-myworkspace --url https://myworkspace.twenty.com/mcp
codex mcp login twenty-myworkspace
```

For local development:

```bash
codex mcp add twenty-local --url http://myworkspace.localhost:3001/mcp
codex mcp login twenty-local
```

OAuth guard for Codex:

- Do not pass `--login` to `codex mcp add`. It is deprecated.
- Codex can open OAuth automatically when it sees the new MCP server. Run `codex mcp login <server-name>` only if the automatic OAuth window does not appear.
- Do not manually run `open <authorization-url>` for an OAuth URL printed by `codex mcp add` unless the user confirms no browser tab opened. Opening the same authorization URL twice creates two callback tabs with the same `state` and different one-time `code` values.

When using the Twenty Codex marketplace plugin, its bundled `setup-mcp.sh` helper automates this flow, including URL normalization and server naming.

### Claude Code

```bash
claude mcp add --transport http twenty-myworkspace https://myworkspace.twenty.com/mcp
```

Claude Code prompts for OAuth authentication when the server is first used; `/mcp` inside a session shows connection and authentication status.

### Cursor

Add the server to `.cursor/mcp.json` in the project (or `~/.cursor/mcp.json` for all projects):

```json
{
  "mcpServers": {
    "twenty-myworkspace": {
      "url": "https://myworkspace.twenty.com/mcp"
    }
  }
}
```

Cursor opens the OAuth flow when the server is enabled in its MCP settings.

### Other MCP Clients

Any client that supports streamable HTTP MCP servers with OAuth works. Configure a server entry pointing at the normalized MCP URL, for example:

```json
{
  "mcpServers": {
    "twenty-myworkspace": {
      "url": "https://myworkspace.twenty.com/mcp"
    }
  }
}
```

If the client does not support OAuth, configure bearer headers only in the user's private MCP client config, never in shared or committed files.

## Validation

After setup, verify the MCP server is available with the client's own inspection command (for example `codex mcp get <server-name>` or `claude mcp list`), or by listing available tools in a fresh session.

When connected, use the Twenty MCP discovery flow:

```text
learn_tools -> execute_tool
```

## Troubleshooting

### Debugging Workflow

Use this workflow when the user reports missing tools, unexpected workspace data, authentication failures, or suspects the agent queried the wrong Twenty workspace.

1. Identify the intended workspace URL or host from the user's request, using Required User Input when it is missing.
2. Normalize the intended workspace to its MCP URL using the URL Normalization rules above.
3. Inspect configured Twenty MCP servers and compare their URLs to the intended normalized URL (`codex mcp list`, `claude mcp list`, or the client's MCP config file).
4. If no configured server points to the intended MCP URL, configure one with a workspace-specific name using the per-agent setup above.
5. If the server exists but authentication fails or MCP startup reports `Auth required`, run the client's OAuth login for that exact server.
6. If the configured server is correct and authenticated but its tools are not visible in the current session, explain that the session may have loaded tools before the server was added or authenticated. Ask the user to reload the agent or start a new session that loads the updated MCP config.
7. Before querying workspace data, confirm the callable Twenty MCP namespace or tool name corresponds to the intended server. If only a different Twenty server is callable, do not use it as a fallback unless the user explicitly asks.
8. When reporting results, state which workspace URL or MCP server was used if there was any ambiguity.

### Common Failure Modes

- If OAuth fails for a self-hosted workspace, check that `SERVER_URL` matches the public workspace origin. OAuth metadata and MCP URLs derive from that value.
- If a local workspace fails over HTTPS, use `http://` explicitly per the localhost normalization rule.
- If the server name already exists, replace that MCP entry with the new URL, or use a custom name to keep multiple workspaces side by side.

### Safety Rules

- Do not put API keys in skill or plugin files. Prefer OAuth login. If an MCP client does not support OAuth, configure bearer headers only in the user's private MCP client config.
- Do not inspect or manually extract OAuth tokens as a workaround.
