# Help center

Lets Twenty's AI agents search the official [Twenty documentation](https://docs.twenty.com) before explaining how to do something in Twenty. Agents call the `app_help_center_search_twenty_documentation` tool and answer from the returned pages instead of guessing menus, buttons or steps from memory.

## What it does

The app declares one MCP server, `help_center`, pointing at `https://docs.twenty.com/mcp`. On install, Twenty fetches the server's tool list once and caches it; the cached tools are then offered to agents like any other tool. Today the server exposes a single tool:

- **search_twenty_documentation** — searches the documentation for a query and returns the matching pages.

The tool reads no workspace data. It only sends the search query an agent provides to the documentation server.

## Setup

No configuration is needed. The documentation server is public and requires no authorization header.

On Twenty Cloud the app is pre-installed on every workspace. Self-hosters install it from the marketplace like any other app, and can uninstall it to stop agents from reaching docs.twenty.com.

## Limitations

- Results come live from the documentation server, so the tool depends on its availability.
- Tool definitions are refreshed when the app is installed or upgraded, or from Settings > Developers > MCP servers.
