# Microsoft Teams for Twenty

Microsoft Teams chat and transcript features in one application.

## Status

The application provides a settings page, the Bot Connector helpers, and a
Microsoft OAuth connection for transcripts. Chat handlers and transcript imports
are still under development. Both features are unavailable in this version and
their workspace settings default to off. Connecting a Microsoft account does not
start transcript imports or register subscriptions. The default application role
has no CRM data access.

See [SETUP.md](SETUP.md) for Microsoft OAuth setup and the transition from the
former Teams Transcripts application.

## Features, settings, and feature flags

- **Features** are the product areas: chat and transcripts. Their code, settings
  components, identifiers, and tests live in `src/features/chat` and
  `src/features/transcripts` respectively.
- **Settings** are workspace choices. `TEAMS_CHAT_ENABLED` and
  `TEAMS_TRANSCRIPTS_ENABLED` are Boolean application variables managed through
  **Settings → Applications → Microsoft Teams → Settings**. Updates use the
  metadata API, which requires permission to manage applications.
- **Feature flags** are developer-controlled release decisions, defined in
  `src/constants/feature-flags.ts`. They follow the server's
  `IS_…_ENABLED` naming and are bundled with the app. Changing them requires a
  new build and deployment; a workspace setting cannot override them.

`IS_CHAT_ASSISTANT_ENABLED` controls availability of chat in this scaffold, and
`IS_TRANSCRIPT_IMPORT_ENABLED` controls transcript imports. Both start as
`false`. A disabled feature is shown as unavailable in settings, retaining any
saved workspace preference.

The frontend and future handlers share
`isFeatureEnabled({ isAvailable, settingValue })`. Pass the feature's development
flag as `isAvailable`; the serialized workspace setting must also be `'true'`.
In a logic function, use `process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY]` or
`process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY]` as `settingValue`.
The settings page initializes from `getApplicationVariable` and updates its
local value after a successful save. Changes made by another client require a
page refresh. Live updates need shared host/SDK support for application-variable
change events.

New routes, connection hooks that start work, workflow actions, schedulers, and
queued workers must check feature availability before starting work and then
validate that feature's credentials. Keep disconnect, uninstall, and cleanup
paths available even when a feature is disabled. When a setting starts managing
external resources, add its enable/disable reconciliation alongside that
feature's handlers. The shared settings component composes each feature's
section; the app's single uninstall hook will compose their cleanup.

Feature flags do not exclude SDK definitions from the manifest or make broken
code buildable. Disabled features must still pass typecheck and build. The
Microsoft OAuth connection remains available independently of the transcript
release flag; connecting an account only stores its credentials for future use.

## Bot server variables

The bot's identity is an Entra app registration behind an Azure Bot resource.
An admin configures these on the Teams application registration under
**Settings → Applications**. They are optional at registration so marketplace
listing does not depend on an Azure Bot being provisioned. Chat requires all
three credentials before bot operations can run.

| Variable                 | Secret | Where it comes from                                                                                                                                                                                               |
| ------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TEAMS_BOT_APP_ID`       | no     | Application (client) ID of the Entra app registration. Public in the Bot Framework protocol, and the expected audience when verifying inbound activities.                                                         |
| `TEAMS_BOT_APP_PASSWORD` | yes    | Client secret of that app registration. Used to mint Bot Connector tokens.                                                                                                                                        |
| `TEAMS_BOT_TENANT_ID`    | no     | Directory (tenant) ID that owns the Azure Bot. Microsoft stopped issuing multi-tenant bots after 2025-07-31, so token minting is tenant-scoped rather than going through the shared `botframework.com` authority. |

## Development

This package is a standalone project rather than a root workspace, so run yarn
from this directory.

```bash
yarn install
yarn lint
yarn typecheck
yarn test:unit
yarn twenty dev:build
```

Installation tests run with `yarn test` against a disposable Twenty workspace.
They install and uninstall the Teams application; see [SETUP.md](SETUP.md).
