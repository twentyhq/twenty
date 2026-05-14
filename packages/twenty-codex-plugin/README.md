# Twenty Codex Plugin

This plugin packages the official Twenty app creation workflow, app operations tooling, app development guidance, publish-facing asset guidance, Twenty documentation MCP server, Twenty workspace MCP setup, and readable CRM record retrieval for Codex.

This workspace package is the source of the repo-local Codex plugin. The repo-local marketplace entry points directly to this package.

## Included Skills

- **Create App** (`create-app`): scaffold a new Twenty app with `create-twenty-app`.
- **Manage App** (`manage-app`): manage and troubleshoot remotes, authentication, dev sync, builds, deploys, logs, function execution, uninstall, and CI/CD for an existing Twenty app.
- **Develop App** (`develop-app`): add objects, fields, logic functions, roles, views, layouts, skills, agents, connection providers, and front component registrations.
- **Publish App** (`publish-app`): prepare a Twenty app README, marketplace metadata, logo, screenshots, and public visual assets.
- **Use Twenty MCP** (`use-twenty-mcp`): configure Twenty MCP, retrieve workspace records, and present results as readable Markdown.

The canonical workflow names are the five skills above.

## Included References

- `references/design/front-component-ui.md`: front component UI guidance.
- `references/develop-app/app-structure-and-cli.md`: app checks, CLI usage, and app structure.
- `references/develop-app/data-model.md`: objects, fields, relations, roles, and permissions.
- `references/develop-app/logic.md`: logic functions, skills, agents, and connection providers.
- `references/develop-app/layout.md`: views, navigation, page layouts, tabs, and front component placement.
- `references/publish-app/prepare-for-app-store.md`: README, marketplace metadata, logos, screenshots, and public assets.
- `references/use-twenty-mcp/setup.md`: workspace MCP URL normalization and OAuth setup.
- `references/use-twenty-mcp/result-formatting.md`: readable Twenty MCP result formatting.

## Included MCP Servers

- `twenty-docs`: public Twenty documentation MCP at `https://docs.twenty.com/mcp`.

## MCP Setup

The plugin works in two layers:

- The bundled `twenty-docs` MCP server works immediately and lets Codex search public Twenty documentation.
- Workspace data access is intentionally user-specific. Each user should use the setup skill or helper to add their own Twenty workspace MCP endpoint to their private Codex MCP config.

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

For that reason, this package does not ship a default `.app.json`. A bundled app declaration would either point to the wrong workspace or expose an app id that is not valid for each user's ChatGPT Developer Mode setup. Keep app declarations local until there is an official shared Twenty connector id.

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
