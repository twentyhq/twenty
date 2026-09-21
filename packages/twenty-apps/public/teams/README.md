# Microsoft Teams for Twenty

Package scaffold for the Microsoft Teams app, alongside the Slack app that
shipped as 1.0.0.

## Status

Scaffolding only. The package declares its application manifest, a default role
with no CRM data access, and the universal identifiers reserved for the entities
the app will declare. There are no logic functions, objects or workflow tools
yet, so installing it adds nothing to a workspace.

## Server variables

The bot's identity is an Entra app registration behind an Azure Bot resource.
An admin fills these in under **Settings → Applications → Microsoft Teams**.

| Variable | Secret | Where it comes from |
|---|---|---|
| `TEAMS_BOT_APP_ID` | no | Application (client) ID of the Entra app registration. Public in the Bot Framework protocol, and the expected audience when verifying inbound activities. |
| `TEAMS_BOT_APP_PASSWORD` | yes | Client secret of that app registration. Used to mint Bot Connector tokens. |
| `TEAMS_BOT_TENANT_ID` | no | Directory (tenant) ID that owns the Azure Bot. Microsoft stopped issuing multi-tenant bots after 2025-07-31, so token minting is tenant-scoped rather than going through the shared `botframework.com` authority. |

## Logo

`public/teams.svg` is a placeholder monogram in the Teams purple, not the
official brand mark. Swap it for the real asset before any store listing.

## Development

This package is a standalone project rather than a root workspace, so run yarn
from this directory.

```bash
yarn install
yarn lint
yarn typecheck
yarn twenty dev:build
```
