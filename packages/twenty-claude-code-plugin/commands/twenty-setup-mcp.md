---
description: Configure the Twenty MCP server for a workspace and start OAuth
allowed-tools: Bash, Read
---

Use the `setup-mcp` skill to configure a workspace-specific Twenty MCP endpoint, normalize the URL, and add it to Claude Code via `claude mcp add --transport http`.

User input: $ARGUMENTS

If `$ARGUMENTS` looks like a workspace URL, host, or MCP URL, normalize it and run the setup helper:

```bash
bash packages/twenty-claude-code-plugin/scripts/setup-mcp.sh $ARGUMENTS
```

Otherwise, ask the user for their Twenty workspace URL (Twenty Cloud subdomain, custom domain, or localhost development domain) before running the helper. After setup, tell the user to run `/mcp` inside Claude Code to start OAuth for the new server.
