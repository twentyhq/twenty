# Twenty Codex Plugin

Official Codex plugin for building, deploying, and querying Twenty apps. Bundles five focused skills, the public Twenty documentation MCP server, and a one-command workspace MCP setup helper.

This package is the source of the plugin published to the Codex marketplace.

## What This Plugin Does

The plugin teaches Codex how to work with the Twenty CRM platform. After installation, Codex can:

- Scaffold a new Twenty app with `create-twenty-app`.
- Add or modify app entities (objects, fields, logic functions, layouts, front components, workflows).
- Manage remotes, sync changes, build, deploy, view logs, and configure CI/CD.
- Prepare README, marketplace metadata, logos, and screenshots for npm/marketplace publication.
- Connect to a Twenty workspace via MCP and present records as readable Markdown with linked record names.

## Installation

### From the Codex Marketplace

Search for "Twenty" in the Codex plugin directory and install.

### Locally for Development

Copy the marketplace template to a local marketplace config:

```bash
cp packages/twenty-codex-plugin/templates/marketplace.example.json .agents/plugins/marketplace.json
```

Then enable it in Codex via the plugin manager. See [`templates/marketplace.example.json`](./templates/marketplace.example.json) for the exact entry shape.

## Skills

| Skill | Use it for |
|---|---|
| [`create-app`](./skills/create-app/SKILL.md) | Scaffold a new Twenty app with `create-twenty-app`. |
| [`develop-app`](./skills/develop-app/SKILL.md) | Add or modify objects, fields, logic functions, layouts, front components, workflows. |
| [`manage-app`](./skills/manage-app/SKILL.md) | Manage remotes, sync, build, deploy, logs, troubleshooting, CI/CD. |
| [`publish-app`](./skills/publish-app/SKILL.md) | Prepare README, marketplace metadata, logos, screenshots, public assets. |
| [`use-twenty-mcp`](./skills/use-twenty-mcp/SKILL.md) | Configure Twenty MCP and retrieve workspace records as readable Markdown. |

Cross-skill operating rules are in [`AGENTS.md`](./AGENTS.md). Reference docs are under [`references/`](./references/).

## MCP Setup

The plugin works in two layers:

- The bundled `twenty-docs` MCP server works immediately and lets Codex search public Twenty documentation.
- Workspace data access is user-specific. Each user adds their own Twenty workspace MCP endpoint to their private Codex MCP config using the helper below.

**Do not** add workspace-specific MCP URLs to this package. They are user-local and belong only in the user's machine-local Codex MCP configuration.

### Quick MCP Setup

```bash
bash packages/twenty-codex-plugin/scripts/setup-mcp.sh myworkspace.twenty.com
```

The helper names the server after the workspace host (`twenty-myworkspace`, `twenty-acme-example`, etc.). Codex may open OAuth automatically after the server is added; if it does not, run `codex mcp login <server-name>`. Use `--force-login` only for terminal-only setup.

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
myworkspace.localhost:3001   -> http://myworkspace.localhost:3001/mcp    name: twenty-myworkspace-localhost-3001
```

### App Declaration

This package ships a Codex app declaration for the public Twenty Developer Tools app:

```json
{
  "apps": {
    "twenty": {
      "id": "asdk_app_6a3bf414b7cc8191a0e2030906ca8a66"
    }
  }
}
```

The public app id is intentionally separate from the Twenty CRM workspace tools app. Workspace-specific MCP URLs still must not be committed; users add those locally with the setup helper above.

## Development

Want to improve the plugin itself? See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for skill authoring, reference editing, validation, and the release process.

### Common Commands

```bash
# Validate the plugin
npx nx run twenty-codex-plugin:validate

# Run validator unit tests
npx nx run twenty-codex-plugin:test
```

### Compliance

Best-practices compliance is tracked in [`CHECKLIST.md`](./CHECKLIST.md) — every official Codex requirement maps to either an automated `validate.js` assertion or a manual sign-off. Changes are recorded in [`CHANGELOG.md`](./CHANGELOG.md).
