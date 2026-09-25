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
5. In Teams admin center > Meetings > Meeting settings > Transcript API access,
   enable **Microsoft Graph access**. Without it, Graph answers transcript
   requests with `GraphAccessToTranscriptsDisabled`.

| Permission                         | Purpose                                           |
| ---------------------------------- | ------------------------------------------------- |
| `User.Read`                        | Identify the connected Microsoft account          |
| `Calendars.ReadBasic`              | Find the scheduled meetings the account organizes |
| `OnlineMeetings.Read`              | Resolve a calendar event to its online meeting    |
| `OnlineMeetingTranscript.Read.All` | List the transcripts of those meetings            |

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

Connecting an account does not import transcripts or register webhooks. The
transcript release flag and workspace setting remain off. Connecting an account
does not enable them.

## Test the list action

1. For a development build, set `IS_TRANSCRIPT_IMPORT_ENABLED` to `true`, rebuild
   and deploy the app, then enable transcripts in the Microsoft Teams settings.
2. Schedule a Teams meeting with the connected account, join it at its
   scheduled time, start transcription, speak, and end the meeting. Microsoft
   publishes the transcript a few minutes later.
3. Ask the Twenty AI assistant to list your Teams transcripts, or add the
   **List My Teams Transcripts** action to a workflow. The result carries one
   entry per transcript with the meeting subject, the Graph meeting ID, and the
   transcript ID.

The action uses your own connection first and falls back to a workspace-shared
one. Optional `startDateTime` and `endDateTime` select the meeting window,
which defaults to the last 31 days; `nextPageUrl` continues a paginated result.

References: [Microsoft authorization code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
and [transcript permissions](https://learn.microsoft.com/en-us/graph/api/onlinemeeting-list-transcripts?view=graph-rest-1.0),
plus [Teams transcript API access settings](https://learn.microsoft.com/en-us/microsoftteams/meeting-transcript-api-access).

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

## Troubleshooting

- No Add connection button: check that the provider was deployed and its two
  server variables are filled.
- Redirect mismatch: register the exact `/auth/apps/callback` URI on the **Web**
  platform, including the correct scheme and hostname.
- Admin approval required: the Microsoft tenant administrator must consent to
  the delegated permissions before the connection can finish.
- `Teams transcripts are not enabled`: enable the transcript release flag in
  the build and the workspace transcript setting.
- `Microsoft Teams is not connected`: the requesting user has no personal
  connection and the workspace has no shared one.
- `GraphAccessToTranscriptsDisabled`: enable Microsoft Graph transcript access
  in Teams meeting settings.
- Empty result: verify that transcription was started during the scheduled
  meeting time, give or take 15 minutes, Microsoft has finished processing it,
  and the connected account organized the meeting.
