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

| Permission                         | Purpose                                                        |
| ---------------------------------- | -------------------------------------------------------------- |
| `User.Read`                        | Identify the connected Microsoft account                       |
| `Calendars.ReadBasic`              | Find the scheduled meetings the account organizes              |
| `OnlineMeetings.Read`              | Resolve a calendar event to its online meeting and its subject |
| `OnlineMeetingTranscript.Read.All` | List and download the transcripts of those meetings            |

The connection also requests `openid`, `profile`, `email`, and `offline_access`
for account identity and refresh tokens. It uses the authorization code flow
with PKCE through Twenty's connection provider.

These OAuth credentials are separate from the `TEAMS_BOT_*` credentials used by
the chat Bot Connector. They are optional at registration so Teams can be
installed without transcript setup. Both must be configured before users can add
a Microsoft connection. See [Bot server variables](#bot-server-variables) for the
bot configuration.

## Microsoft 365 organization settings

Microsoft applies these per organization, so a Microsoft 365 admin of every
organization whose users connect sets them in Teams admin center > Meetings >
Meeting settings > Transcript API access:

- Turn on **Microsoft Graph access**. Without it, Graph answers transcript
  requests with `GraphAccessToTranscriptsDisabled`.
- Select **Configure** and turn on **Include speaker attribution**, which is off
  by default. Without it, Microsoft serves transcripts without speaker names.

In Teams PowerShell, both are
`Set-CsTeamsMeetingConfiguration -Identity Global -EnableGraphTranscriptAccess $true -EnableAttributedTranscripts $true`.
The same admin consents to the delegated permissions when the organization
requires it.

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

## Chat

Chat lets workspace members message the Teams Assistant bot from Microsoft
Teams. It needs the [bot server variables](#bot-server-variables), the
`IS_CHAT_ASSISTANT_RELEASED` release flag, and the workspace's **Enable chat**
setting.

1. In the Azure Bot resource, set the messaging endpoint to
   `https://<your-twenty-host>/webhooks/server/c78db1b1-a0ec-4183-9edd-63299ab5a477`
   and enable the Microsoft Teams channel. The Twenty server must be reachable
   from the internet over HTTPS.
2. Add the bot to a Teams app (for example in the Teams Developer Portal, using
   `TEAMS_BOT_APP_ID` as the bot ID) and install it for your users.
3. Turn on **Enable chat**, then add a **workspace-shared** Microsoft connection.
   Adding it claims the connection's Microsoft tenant for this workspace, so
   activities from that tenant route here. Personal connections do not claim a
   tenant, and a tenant can only be claimed by one workspace.

The route verifies the Bot Framework token on every activity and ignores
activities from tenants no workspace has claimed. The bot answers direct
messages, and channel or group messages that mention it. It answers as the
workspace member whose email matches the sender's Microsoft account, links that
account under **Linked Teams accounts**, and replies with a short notice when no
member matches. Members who can manage roles can remove a link there; an
account matched on email is linked again on its next message.

## Connect

Open **Settings > Applications > Microsoft Teams > Settings**, select
**Add connection**, and sign in with your Microsoft work or school account.

The transcript release flag is off by default, and connecting an account does
not enable it. With it on, connecting an account also creates a Microsoft Graph subscription to the transcripts of the meetings
that account organizes. Graph delivers its notifications to
`https://<your-twenty-host>/webhooks/server/d62e36e1-82bb-4f78-b2ab-54a31faaafab`,
so the Twenty server must be reachable from the internet over HTTPS. New
transcripts then import automatically into Call Recordings as Microsoft
publishes them. A connection added while transcripts were off has no
subscription: reconnect it after turning transcripts on. Disconnecting the
account or uninstalling the app deletes the subscription.

Connecting also imports the transcripts of the last 31 days, once per
connection. Reconnecting starts it again only when that import failed or
stalled. Use the **Sync Teams Transcript** action for a single transcript, such as one that Microsoft had not published about two and a half
hours after the meeting or whose import keeps failing.

Transcripts link to the meeting's calendar event when that calendar is synced in
Twenty. An occurrence of a recurring meeting links to the series' event.

Each Call Recording that Microsoft Teams imports gets an AI summary, including
the 31-day import on connect. Each summary uses AI credits; turn off **Enable
transcript summaries** in **Settings > Applications > Microsoft Teams >
Settings** to stop them. Run **Generate call summary** on selected Call
Recordings, or on calendar events for the latest Teams recording of each, to
write or rewrite their summary, up to 20 calls at a time.

## Test the transcript actions

1. For a development build, set `IS_TRANSCRIPT_IMPORT_RELEASED` to `true`, then
   rebuild and deploy the app.
2. Schedule a Teams meeting with the connected account, join it at its
   scheduled time, start transcription, speak, and end the meeting. Microsoft
   publishes the transcript a few minutes later.
3. Ask the Twenty AI assistant to list your Teams transcripts, or add the
   **List My Teams Transcripts** action to a workflow. The result carries one
   entry per transcript with the meeting subject, the Graph meeting ID, and the
   transcript ID.
4. Ask the assistant to sync one of them, or add **Sync Teams Transcript** to
   the workflow with that `meetingId` and `transcriptId`. The transcript appears
   as a Call Recording named after the meeting subject, linked to the meeting's
   calendar event when Twenty has synced it.

Both actions use your own connection first and fall back to a workspace-shared
one. Optional `startDateTime` and `endDateTime` select the meeting window,
which defaults to the last 31 days; `nextPageUrl` continues a paginated result.

Syncing the same transcript again updates the same Call Recording. A Call
Recording deleted in Twenty stays deleted. If Microsoft is still processing the
transcript, the recording is saved as Processing; sync it again later.

References: [Microsoft authorization code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
and [transcript permissions](https://learn.microsoft.com/en-us/graph/api/onlinemeeting-list-transcripts?view=graph-rest-1.0),
plus [Teams transcript API access settings](https://learn.microsoft.com/en-us/microsoftteams/meeting-transcript-api-access).

## Features, settings, and release flags

- **Features** are the product areas: chat and transcripts. Their code, settings
  components, identifiers, and tests live in `src/features/chat` and
  `src/features/transcripts` respectively.
- **Settings** are workspace choices. `TEAMS_CHAT_ENABLED`,
  `TEAMS_TRANSCRIPTS_ENABLED` and `TEAMS_TRANSCRIPT_SUMMARY_ENABLED` are Boolean
  application variables. **Settings → Applications → Microsoft Teams →
  Settings** manages chat and transcript summaries; transcripts are on by
  default and have no switch. Updates use the metadata API, which requires
  permission to manage applications.
- **Release flags** are developer-controlled release decisions, defined in
  `src/constants/release-flags.ts` and bundled with the app. They are not the
  server's workspace feature flags, so they are named `IS_…_RELEASED`. Changing
  them requires a new build and deployment; a workspace setting cannot override
  them.

`IS_CHAT_ASSISTANT_RELEASED` controls availability of chat in this scaffold,
`IS_TRANSCRIPT_IMPORT_RELEASED` controls transcript imports and summaries, and
`IS_TRANSCRIPT_HISTORY_IMPORT_RELEASED` shows the Import history section. All
start as `false`. Settings hides chat and Import history until their flags are
on, and shows transcript summaries as unavailable until transcripts are,
retaining any saved workspace preference.

The frontend and handlers share
`isFeatureEnabled({ isAvailable, settingValue })`. Pass the feature's release
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

Release flags gate behavior at runtime, not installation. The build puts every
file that default-exports a `define…` call in the manifest, so a disabled
feature's objects, fields, indexes, roles, agents and logic functions are still
installed, and its handlers return before doing any work. The only definitions
a flag changes are the transcript summary functions: they declare their Call
Recording triggers only while `IS_TRANSCRIPT_IMPORT_RELEASED` is on, so they are
not invoked before release. Disabled features must still pass typecheck and
build. The Microsoft OAuth connection remains available independently of the
transcript release flag; connecting an account only stores its credentials for
future use.

## Development

This package is a standalone project rather than a root workspace, so run yarn
from this directory with the Node version in `.nvmrc` and Yarn 4:

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
  the build.
- `Microsoft Teams is not connected`: the requesting user has no personal
  connection and the workspace has no shared one.
- `GraphAccessToTranscriptsDisabled`: enable Microsoft Graph transcript access
  in Teams meeting settings.
- Call Recording without speaker names: the organization has **Include speaker
  attribution** off, so Microsoft serves transcripts without speakers and the
  app logs a warning starting with `[teams] Microsoft withheld speaker names`.
  Turn it on as in
  [Microsoft 365 organization settings](#microsoft-365-organization-settings);
  it can take a while to apply. Run **Sync Teams Transcript** on a transcript
  imported before then to add its speaker names.
- Empty result: verify that transcription was started during the scheduled
  meeting time, give or take 15 minutes, Microsoft has finished processing it,
  and the connected account organized the meeting.
