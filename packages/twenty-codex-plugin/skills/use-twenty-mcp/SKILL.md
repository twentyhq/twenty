---
name: use-twenty-mcp
description: Use when the user wants Codex to connect to an existing Twenty workspace through MCP to interact with workspace data.
---

# What It Is

Twenty MCP connects Codex to an existing Twenty workspace so the agent can inspect workspace data and metadata: records, objects, fields, schema, configuration, and related CRM context.

This is different from a Twenty app. Use `$create-app` when the user wants to scaffold a new app codebase, and `$develop-app` when the user wants to add app-defined features such as objects, fields, logic, layouts, or components.

Use `$use-twenty-mcp` when the user wants to connect Codex to an already running workspace, retrieve or inspect workspace data, inspect metadata, or troubleshoot MCP access.

Do not use MCP as the default way to customize a workspace. For example, prefer creating a new object through a Twenty app rather than directly through MCP. Use MCP for workspace customization only when the user explicitly asks to do it through MCP.

# Setup

Use `../../references/use-twenty-mcp/setup.md` for workspace URL normalization, MCP server configuration, OAuth guardrails, and setup troubleshooting.

# Retrieval

Use `../../references/use-twenty-mcp/result-formatting.md` for selecting the right Twenty MCP workspace, querying records, building record links, formatting dates and values, and presenting readable Markdown instead of raw API output.
