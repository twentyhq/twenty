# Microsoft Teams setup

## Microsoft application

1. In Microsoft Entra, create an app registration supporting **Accounts in any
   organizational directory**. The provider uses the `organizations` endpoint;
   personal Microsoft accounts are not supported.
2. Add a **Web** redirect URI:
   `https://<your-twenty-host>/auth/apps/callback`.
3. Create a client secret. Set `MICROSOFT_CLIENT_ID` and
   `MICROSOFT_CLIENT_SECRET` on the Microsoft Teams application registration in
   Twenty. Use the secret **Value**, not its ID.
4. Add the Microsoft Graph delegated permissions below and obtain administrator
   consent where required by your organization.

| Permission                         | Purpose                                                 |
| ---------------------------------- | ------------------------------------------------------- |
| `User.Read`                        | Identify the connected Microsoft account                |
| `Calendars.ReadBasic`              | Discover scheduled meetings in the upcoming import flow |
| `OnlineMeetings.Read`              | Read meeting metadata in the upcoming import flow       |
| `OnlineMeetingTranscript.Read.All` | Read transcripts in the upcoming import flow            |

The connection also requests `openid`, `profile`, `email`, and `offline_access`
for account identity and refresh tokens. It uses the authorization code flow
with PKCE through Twenty's connection provider.

These OAuth credentials are separate from the `TEAMS_BOT_*` credentials used by
the chat Bot Connector. They are optional at registration so Teams can be
installed without transcript setup. Both must be configured before users can add
a Microsoft connection. See [README.md](README.md#bot-server-variables) for the
bot configuration.

## Connect

Open **Settings > Applications > Microsoft Teams > Settings**, select
**Add connection**, and sign in with your Microsoft work or school account.

This version stores the connection; it does not import transcripts or register
webhooks. The transcript release flag and workspace setting remain off. Connecting
an account does not enable them.

References: [Microsoft authorization code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
and [transcript permissions](https://learn.microsoft.com/en-us/graph/api/onlinemeeting-list-transcripts?view=graph-rest-1.0).

## Development

Use the Node version in `.nvmrc` and Yarn 4. From this directory:

```bash
yarn install --immutable
yarn lint
yarn typecheck
yarn test:unit
yarn twenty dev:build
```

Installation tests use a disposable Twenty workspace. Configure
`TWENTY_API_URL` and `TWENTY_API_KEY` for that workspace, then run `yarn test`.
The test setup installs and uninstalls the application; do not use the shared QA
workspace. Public apps use the monorepo CI workflows.
