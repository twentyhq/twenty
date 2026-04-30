# twenty-exa

Exposes [Exa](https://exa.ai) structured web search to Twenty AI agents
(chat + workflow agents + MCP) as the `app_exa_web_search` tool.

## Installation

1. Register the app on the Twenty server once (admin API / UI):
   `twenty-exa` from npm.
2. Set `isPreInstalled=true` on the registration so it's installed on
   every new workspace. Existing workspaces can be backfilled via the
   `install-pre-installed-apps` CLI command.
3. Set the `EXA_API_KEY` server variable on the registration to your Exa
   API key. The value is injected into every logic function execution —
   no per-workspace configuration needed.

## Billing

The handler calls Twenty's generic app billing endpoint
(`POST /app/billing/charge`) using the application access token injected
into the execution env. Pricing mirrors Exa's auto-search tier: $0.007
base (10 results) + $0.001 per additional result.
