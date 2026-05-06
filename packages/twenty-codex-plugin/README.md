# Twenty Codex Plugin

This plugin packages the official Twenty app creation workflow, Twenty documentation MCP server, and Twenty workspace MCP connection for Codex.

This workspace package is the source of the repo-local Codex plugin. The repo-local marketplace entry points directly to this package.

## Included Skills

- `create-an-app`: scaffold, run, and troubleshoot a Twenty app with `create-twenty-app`.
- `setup-mcp`: collect a workspace URL, normalize the MCP endpoint, configure Codex, and guide OAuth login.
- `app-readme-and-visuals`: prepare a Twenty app README, marketplace metadata, logo, screenshots, and public visual assets.

## Included MCP Servers

- `twenty-docs`: public Twenty documentation MCP at `https://docs.twenty.com/mcp`.

## MCP Setup

The plugin ships only the public Twenty documentation MCP URL. Marketplace users should use the setup skill or helper to configure their own Twenty workspace endpoint in their private Codex MCP config.

Do not add workspace-specific MCP URLs to this package. Workspace MCP URLs are user-specific and belong in the local Codex MCP configuration created by the setup helper.

## Quick MCP Setup

Use the CLI helper when configuring MCP from a terminal:

```bash
bash packages/twenty-codex-plugin/scripts/setup-mcp.sh myworkspace.twenty.com
```

By default, the helper names the server after the workspace host, such as `twenty-myworkspace` or `twenty-acme-example`. Codex may open OAuth automatically after the server is added. If it does not, run `codex mcp login <server-name>`; use `--force-login` only for terminal-only setup.

Equivalent manual CLI setup:

```bash
codex mcp add twenty-myworkspace --url https://myworkspace.twenty.com/mcp
codex mcp login twenty-myworkspace
```

Supported workspace forms:

```text
myworkspace.twenty.com       -> https://myworkspace.twenty.com/mcp       name: twenty-myworkspace
acme.example.com             -> https://acme.example.com/mcp             name: twenty-acme-example
myworkspace.customdomain.com -> https://myworkspace.customdomain.com/mcp name: twenty-myworkspace-customdomain
myworkspace.localhost:3001   -> http://myworkspace.localhost:3001/mcp   name: twenty-myworkspace-localhost-3001
```

## App Declaration

Codex app declarations require a ChatGPT-created app or connector id. The plugin can reference that id, but it cannot create one from an MCP URL by itself.

After creating the Twenty app in ChatGPT Developer Mode with your workspace MCP URL, add `packages/twenty-codex-plugin/.app.json`:

```json
{
  "apps": {
    "twenty": {
      "id": "asdk_app_OR_connector_ID_FROM_CHATGPT"
    }
  }
}
```

Then add `"apps": "./.app.json"` to `packages/twenty-codex-plugin/.codex-plugin/plugin.json` and include `.app.json` in this package's `files` array.

The repo-local marketplace entry is defined in `.agents/plugins/marketplace.json`.
