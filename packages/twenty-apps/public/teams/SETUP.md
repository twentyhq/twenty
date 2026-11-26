# Teams setup

## Microsoft application

1. In Microsoft Entra, create an app registration supporting **Accounts in any
   organizational directory**. The provider uses the `organizations` endpoint;
   personal Microsoft accounts are not supported.
2. Add a **Web** redirect URI:
   `https://<your-twenty-host>/auth/apps/callback`.
3. Create a client secret. Set `MICROSOFT_CLIENT_ID` and
   `MICROSOFT_CLIENT_SECRET` on the Teams application registration in
   Twenty. Use the secret **Value**, not its ID.
4. Add the Microsoft Graph delegated permissions below and obtain administrator
   consent where required by your organization.

| Permission                         | Purpose                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `User.Read`                        | Identify the connected Microsoft account                                            |
| `User.ReadBasic.All`               | List and search the organization directory to link Teams users to workspace members |
| `Calendars.ReadBasic`              | Find the scheduled meetings the account organizes                                   |
| `OnlineMeetings.Read`              | Resolve a calendar event to its online meeting and its subject                      |
| `OnlineMeetingTranscript.Read.All` | List and download the transcripts of those meetings                                 |

The connection also requests `openid`, `profile`, `email`, and `offline_access`
for account identity and refresh tokens. It uses the authorization code flow
with PKCE through Twenty's connection provider. A permission added after a
connection was created, such as `User.ReadBasic.All`, only takes effect once
that connection is reconnected.

These OAuth credentials are separate from the `TEAMS_BOT_*` credentials used by
the chat Bot Connector. They are optional at registration so Teams can be
installed without transcript setup. Both `MICROSOFT_CLIENT_ID` and
`MICROSOFT_CLIENT_SECRET` must be configured before users can add a Microsoft
connection. Bot credentials are not needed for transcript imports. See
[Bot server variables](#bot-server-variables) for chat.

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

These variables are for the Teams chat assistant. Skip this section when setting
up transcript imports.

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
Teams. It needs the [bot server variables](#bot-server-variables) and the
workspace's **Enable chat** setting. Chat supports Microsoft 365 commercial
tenants. GCC tenants should work according to Microsoft's documentation but
have not been tested. GCC High and DoD tenants are not supported.

1. In the Azure Bot resource, set the messaging endpoint to
   `https://<your-twenty-host>/webhooks/server/<application-registration-id>/c78db1b1-a0ec-4183-9edd-63299ab5a477`
   and enable the Microsoft Teams channel. See [where to find the application
   registration id](#application-registration-id). The Twenty server must be
   reachable from the internet over HTTPS.
2. Build the Teams app package and install it for your users. From a checkout
   of this directory (`packages/twenty-apps/public/teams`):

   ```bash
   yarn install
   yarn teams-app:package --bot-app-id <TEAMS_BOT_APP_ID>
   ```

   This writes `dist/teams-app-package.zip` from
   [`teams-app-package/`](./teams-app-package): the manifest, with the bot ID
   filled in, and the two icons. A Teams admin uploads it in Teams admin
   center > Teams apps > Manage apps > Upload new app, then allows it for the
   users who need it. For a quick test, upload it from the Teams client under
   Apps > Manage your apps > Upload an app, where custom app upload is
   allowed. For users of other Microsoft organizations to install the bot,
   the bot's Entra app registration must support **Accounts in any
   organizational directory**; the Azure Bot stays **Single Tenant**.
   The manifest also declares the bot's prompt starters. Teams only reads them
   from an uploaded package, so after pulling a manifest change, rebuild the
   package and upload it again as an update; its `version` is bumped with each
   change so Teams accepts it over the installed one.

3. Add a **workspace-shared** Microsoft connection and turn on **Enable chat**,
   in either order. The connection claims its Microsoft tenant for this
   workspace, whatever the setting, so activities from that tenant route here;
   **Enable chat** only decides whether the bot answers them. Connections that
   existed before chat was released are claimed when the app is upgraded.
   Adding a connection while chat is on also links every directory user whose
   email matches a workspace member; otherwise members link on their first
   message or from **Auto-link by email**. Personal connections do not claim a
   tenant, and a tenant can only be claimed by one workspace, even one that has
   chat turned off. When another workspace already holds the tenant, the
   connection is kept for transcripts and the app settings page shows an error
   banner until that workspace disconnects and this one reconnects. A warning
   banner shows when chat is on but the tenant is not claimed.

The route verifies the Bot Framework token on every activity. When no workspace
has claimed the sender's tenant, the bot says so in that conversation, at most
once an hour, and does nothing else; it does the same when the claiming
workspace has turned **Enable chat** off. The bot answers direct messages, and
channel or group messages that mention it. It posts a short welcome when it is
installed, once per conversation, and answers `help`, `hi`, `hello` or a bare
mention with the same text, without running the assistant or needing a linked
account. In a personal chat that text comes with its example questions as
suggested actions. It answers as the
workspace member whose email matches the sender's Microsoft account, links that
account under **Linked Teams accounts**, and replies with a short notice when no
member matches. Members who can manage roles can remove a link there, link a
directory user by hand, or press **Auto-link by email** to match the whole
directory again; an account matched on email is linked again on its next
message or on the next auto-link run. A message's text is saved on its Teams
Assistant Request only once the sender is matched to a workspace member, so
messages from unlinked accounts are not stored. Requests recorded before this
behavior shipped keep their text.

## Twenty registration and shared webhook

The transcript webhook uses a server route shared by all installations on a
Twenty instance. Its resolver runs in the application's **owner workspace**.
Before users connect Microsoft accounts:

1. After publishing and catalog sync, [claim the
   app](https://docs.twenty.com/developers/extend/apps/operations/publishing#claiming-your-app)
   in **Settings → Developers → Apps** using `@twentyhq/teams`. This requires
   npm provenance from the public GitHub repository and an authorized GitHub
   owner. Ownership is separate on each Twenty instance.
2. Open the registration under **My apps**, then set `MICROSOFT_CLIENT_ID` and
   `MICROSOFT_CLIENT_SECRET` in **Config → Server Variables**.
3. In **Distribution**, choose **See on marketplace** and install the app in
   the owner workspace. Keep that installation enabled: removing it interrupts
   transcript webhooks for every workspace on the instance.
4. Install in a second workspace and verify that connecting an account creates
   a Graph subscription and that a new meeting transcript imports. Check both
   the resolver's logs in the owner workspace and the target function's logs in
   the second workspace.

An unclaimed app, or one not installed in its owner workspace, returns `404`
(`LOGIC_FUNCTION_NOT_FOUND`) on the shared webhook even if another workspace
has installed it. See [server-route
setup](https://docs.twenty.com/developers/extend/apps/operations/publishing#setting-up-server-routes).

### Application registration id

Server route URLs have the form
`https://<your-twenty-host>/webhooks/server/<application-registration-id>/<logic-function-id>`.
The application registration id is specific to each Twenty instance. To find
it, open the registration under **Settings → Developers → Apps → My apps**: it
is the last segment of that page's URL,
`/settings/developers/apps/<application-registration-id>`.

URLs without the registration id are deprecated and will stop resolving. If an
endpoint was registered in that form, update it to the form above.

## Connect

Open **Settings > Applications > Teams > Settings**, select
**Add connection**, and sign in with your Microsoft work or school account.
This adds a workspace-shared connection.

Members can also add a personal connection from **Settings > App preferences**.
Each personal connection imports the meetings its account organizes, so every
organizer connects their own account. Members can only finish connecting once
a Microsoft 365 admin has consented to `OnlineMeetingTranscript.Read.All` for
the organization. Personal connections do not claim a tenant for chat.

Transcript imports are on by default. Connecting an account creates a Microsoft
Graph subscription to the transcripts of the meetings that account organizes.
Graph delivers its notifications to
`https://<your-twenty-host>/webhooks/server/<application-registration-id>/d62e36e1-82bb-4f78-b2ab-54a31faaafab`,
a URL the app builds itself, so the Twenty server must be reachable from the
internet over HTTPS. New
transcripts then import automatically into Call Recordings as Microsoft
publishes them. If upgrading from a development build with transcript imports
disabled, reconnect existing accounts to start their subscription and initial
import. Disconnecting the account or uninstalling the app deletes the
subscription.

Connecting also imports the transcripts of the last 31 days, once per
connection. Reconnecting starts it again only when that import failed or
stalled. The settings control for choosing a separate history import is not
available in this release. Use the **Sync Teams Transcript** action for a single
transcript, such as one that Microsoft had not published about two and a half
hours after the meeting or whose import keeps failing.

Transcripts link to the meeting's calendar event when that calendar is synced in
Twenty. An occurrence of a recurring meeting links to the series' event.

AI summaries are off by default. Turn on **Enable transcript summaries** in
**Settings > Applications > Teams > Settings** to summarize each Call
Recording that Microsoft Teams imports, including the 31-day import on connect.
Each summary uses AI credits. Run **Generate call summary** on selected Call
Recordings, or on calendar events for the latest Teams recording of each, to
write or rewrite their summary, up to 20 calls at a time. This command also
requires **Enable transcript summaries** to be on.

## Test the transcript actions

1. Schedule a Teams meeting with the connected account, join it at its
   scheduled time, start transcription, speak, and end the meeting. Microsoft
   publishes the transcript a few minutes later.
2. Ask the Twenty AI assistant to list your Teams transcripts, or add the
   **List My Teams Transcripts** action to a workflow. The result carries one
   entry per transcript with the meeting subject, the Graph meeting ID, and the
   transcript ID.
3. Ask the assistant to sync one of them, or add **Sync Teams Transcript** to
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
  application variables. **Settings → Applications → Teams →
  Settings** manages chat and transcript summaries; transcripts are on by
  default and have no switch, and summaries are off by default. Updates use the
  metadata API, which requires permission to manage applications.
- **Release flags** are developer-controlled release decisions, defined in
  `src/constants/release-flags.ts` and bundled with the app. They are not the
  server's workspace feature flags, so they are named `IS_…_RELEASED`. Changing
  them requires a new build and deployment; a workspace setting cannot override
  them.

`IS_TRANSCRIPT_HISTORY_IMPORT_RELEASED` shows the Import history section. It
starts as `false`, so Settings hides Import history until the flag is on,
retaining any saved workspace preference. Chat, transcript imports and summaries
have no release flag.

A feature is on when its workspace setting is `'true'`. In a logic function,
`isTeamsChatEnabled()` reads `process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY]`
and transcript handlers call `isTeamsTranscriptImportEnabled()`.
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
installed, and its handlers return before doing any work. Disabled features
must still pass typecheck and build.

## Development

This package is a standalone project rather than a root workspace, so run yarn
from this directory with the Node version in `.nvmrc` and Yarn 4:

```bash
yarn install --immutable
yarn lint
yarn typecheck
yarn test:unit
twenty app build
```

Install the standalone CLI with `npm install -g twenty`.

Installation tests use a disposable Twenty workspace. Configure
`TWENTY_API_URL` and `TWENTY_API_KEY` for that workspace, then run `yarn test`.
The test setup installs and uninstalls the application; do not use the shared QA
workspace. Public apps use the monorepo CI workflows.

## Release checklist

- Deploy the Twenty server changes that add Teams to the featured and
  billing-exempt application lists **before publishing and the first catalog
  sync**. Publishing the npm package alone does not make imports free. Listing
  is set when the catalog first creates the registration; a later catalog sync
  does not change an existing registration's listing status.
- Confirm the release version in `package.json`, run the development checks
  above, and inspect the built package before publishing with npm provenance.
  Publish through the Twenty CLI so the manifest and built files are included.
- Complete [registration and shared-webhook setup](#twenty-registration-and-shared-webhook).
  Confirm the app appears in the marketplace and that its owner
  workspace and Microsoft OAuth credentials are configured.
- Run a live pilot from a second workspace: consent and connection, the 31-day
  initial import, a newly transcribed meeting, calendar linking, and a repeated
  sync without duplicate Call Recordings. Verify the summaries switch, automatic
  and manual summaries, and expected AI-credit usage. Confirm ordinary transcript
  imports consume no logic-function credits, and check failed-consent/API errors
  and disconnect cleanup. Record the results before announcing availability.

## Troubleshooting

- Webhook returns `404` / `LOGIC_FUNCTION_NOT_FOUND`: claim the registration and
  install the app in its owner workspace as described above.
- No Add connection button: check that the provider was deployed and its two
  server variables are filled.
- Redirect mismatch: register the exact `/auth/apps/callback` URI on the **Web**
  platform, including the correct scheme and hostname.
- Admin approval required: the Microsoft tenant administrator must consent to
  the delegated permissions before the connection can finish.
- `Teams transcripts are not enabled`: check that the application variable
  `TEAMS_TRANSCRIPTS_ENABLED` is `true`. It defaults to `true` in this release;
  there is no transcript release flag. Reconnect accounts added while imports
  were disabled.
- `Microsoft Teams is not connected`: the requesting user has no personal
  connection and the workspace has no shared one.
- `Microsoft Teams chat is taken by another workspace`: another workspace on
  this Twenty instance claimed the same Microsoft tenant first, so chat
  activities route there. Disconnect Microsoft Teams in that workspace, then
  remove and add the workspace connection here to claim the tenant.
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
