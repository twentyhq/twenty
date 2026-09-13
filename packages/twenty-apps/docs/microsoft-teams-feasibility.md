# Microsoft Teams app: feasibility and roadmap

Written 2026-09-08, one week after the Slack app shipped as 1.0.0. This is
research, not a design doc: it answers how hard a Teams app is, how much of the
Slack app carries over, what blocks us, and in what order to build.

## Verdict

Feasible, and structurally the same product. Roughly half of the Slack app
(assistant request queue, worker, run-as permission model, user links, consent
flow, settings UI, test harness) ports with renames. Everything at the edges is
different: how Teams authenticates us, how we reply, how the bot gets installed,
and how the app reaches customers.

Expect about 1.3x to 1.5x the Slack effort for the app itself, plus two things
Slack never needed: two small platform changes in `twenty-server`, and a
Microsoft Teams Store submission for Twenty Cloud, which is on Microsoft's
clock rather than ours.

| | Slack app (actual) | Teams app (estimate) |
|---|---|---|
| Merged PRs | 44 (2026-05-10 to 2026-09-07) | |
| Calendar time to 1.0 | ~4 months, mostly one engineer | ~3 to 4 months of engineering |
| App source | ~13.8k lines, ~330 files | Similar, minus what ports |
| Tests | ~3.3k lines, MSW fake of the Slack Web API | Same layout, fake Bot Connector plus fake JWKS |
| Platform changes needed | None | Two (see Blockers 4 and 5) |
| Distribution | One Slack app, any workspace installs via OAuth | Store listing for Cloud; per-tenant Azure Bot for self-hosters |

## How the Slack app is built (what we are porting)

The Slack app under `packages/twenty-apps/public/slack` has four layers, and the
Teams app keeps the same four:

1. **Connection.** A `defineConnectionProvider` of type `oauth`. On connect, a
   logic function calls `auth.test`, claims the Slack team id for the Twenty
   workspace in a server-scoped `kv` key, links the installer, and sweeps the
   roster by email.
2. **Inbound.** Two logic functions with `serverRouteTriggerSettings` act as
   resolvers. They run in the app's owner workspace, verify the Slack HMAC
   signature over `rawBody`, read the team id from the payload, look up the
   claimed workspace, and return `{ workspaceId, targetLogicFunctionUniversalIdentifier, payload }`.
   The server queues the target function in that workspace. A resolver can
   instead return a `Response` to answer synchronously (used for Slack's
   `url_verification` challenge).
3. **Assistant.** The enqueue function writes a `slackAssistantRequest` record.
   A database-event worker picks it up, resolves who to run as (email-matched
   or consented user link), runs the `slack-assistant` agent with
   `runAgent`, posts the answer with feedback buttons, and keeps a thread
   subscription in `kv` for un-mentioned follow-ups.
4. **Tools and settings.** Workflow steps (post, update, delete, ephemeral,
   reaction, list channels), a `slackUserLink` object, and a
   `defineSettingsFrontComponent` for managing links.

Layers 3 and 4 are mostly transport-agnostic. Layers 1 and 2 are where Teams
diverges.

## Teams in one page

A Teams bot is three registrations, not one:

- An **Entra ID app registration** (client id + secret). This is the bot's
  identity for both directions of traffic.
- An **Azure Bot resource** in an Azure subscription, pointing the Teams
  channel at our messaging endpoint. Standard channels including Teams are
  free, but the resource needs a subscription.
- A **Teams app package** (a manifest zip) that declares the bot id, scopes
  (personal, team, groupchat), permissions, and any message extension.
  Installed per tenant by an admin or, if the tenant allows it, by users.

Traffic is the Bot Framework **Activity** protocol. Teams POSTs an activity to
our endpoint with a Bearer JWT signed by the Bot Connector. We reply by POSTing
to `{serviceUrl}/v3/conversations/{conversationId}/activities` with a token we
mint ourselves via client credentials. There is no per-workspace OAuth token as
in Slack: the same app identity serves every tenant.

The SDK landscape moved in 2025: the Bot Framework SDK is archived (support
ended 2025-12-31). Microsoft now points to the Teams SDK (`@microsoft/teams.*`,
GA for JavaScript) or the Microsoft 365 Agents SDK (`@microsoft/agents-*`).
Both assume they own an HTTP server, which does not fit a logic function. The
right shape for us is what the Slack app did with `@slack/web-api`: a thin REST
client (`@microsoft/teams.api`, or plain `fetch`) plus our own JWT verification,
which Microsoft documents as seven explicit checks for exactly this case.

## Slack to Teams mapping

| Concern | Slack app today | Teams equivalent | Ports? |
|---|---|---|---|
| Install identity | Slack app with bot scopes, per-workspace bot token from OAuth | Entra app + Azure Bot, client-credentials token minted per call and cached ~1h | No, rewrite |
| Inbound auth | HMAC over raw body, `x-slack-signature` | RS256 JWT in `Authorization`, JWKS from `login.botframework.com`, check issuer, audience = app id, `serviceUrl` claim | No, rewrite |
| Tenant to workspace | `team_id` claimed in `kv` (SERVER scope) on connect | `channelData.tenant.id` claimed the same way | Yes, rename |
| Resolver routing | `event.type` switch | `activity.type` (`message`, `conversationUpdate`, `installationUpdate`, `invoke`) plus `invoke.name` | Yes, new switch |
| Ack deadline | 3s | 15s for messages (Teams retries after that), 5s for invokes | Fine, queued model already async |
| Reply | `chat.postMessage` to a channel id | POST activity to `serviceUrl` + conversation id, `replyToId` for threads | No, rewrite the client |
| Threads | `thread_ts` everywhere, DMs have threads | Channel posts are threaded (`conversation.id` carries `messageid=`); personal chats have no threads | Partial, thread memory model changes |
| Rich replies | Block Kit, `markdown_text` | Adaptive Cards 1.5, limited markdown in `text` | No, new renderer |
| Thinking status | `assistant.threads.setStatus` | `typing` activity, or streaming "informative" updates (1:1 only) | Small |
| Feedback buttons | Interactivity endpoint, block actions | `channelData.feedbackLoop`, invoke `message/submitAction` | Partial, see Blocker 5 |
| AI label | None | `entities` with `AIGeneratedContent`, mandatory for Store | New, trivial |
| Suggested prompts | `assistant.threads.setSuggestedPrompts` on `app_home_opened` | Manifest `commandLists` (static) | Small |
| Channel welcome | `member_joined_channel` | `conversationUpdate` with `membersAdded` containing the bot | Yes |
| Un-mentioned follow-ups | `message.channels` / `message.groups` events | RSC permission `ChannelMessage.Read.Group` / `ChatMessage.Read.Chat` in manifest, consented by the team owner at install | Partial, see Blocker 6 |
| Who is asking | `user` id, `users.info` gives verified email | `from.aadObjectId`. Whether the bot member API still returns `email` is unresolved, see Blocker 2b | Unresolved |
| Roster sweep | `users.list` paged | Paged members API per team; personal-scope installs have no roster, so a tenant-wide sweep needs Graph `User.ReadBasic.All` on the admin's delegated token | Partial |
| Consent DM | `conversations.open` + `im:write` | `POST /v3/conversations` with `tenantId` and the member, then post | Yes |
| Uninstall / revoke | `app_uninstalled`, `tokens_revoked` | `installationUpdate` with `action: remove` | Yes |
| Link previews | `link_shared` event, async `chat.unfurl` | Message extension `messageHandlers`, synchronous `composeExtension/queryLink` invoke, 5s | No, see Blocker 4 |
| Rate limits | Tiered per method | 50 RPS per app per tenant, 7 sends/sec per conversation, retry on 429/412/502/504 | Same shape |
| Copilot | n/a | Manifest `copilotAgents.customEngineAgents` (schema 1.21+) surfaces the same bot in M365 Copilot Chat | Free upside |

## Blockers and challenges, ranked

### 1. Distribution: single-tenant bots and the Teams Store (high)

Microsoft stopped allowing new multi-tenant bot registrations on 2025-07-31.
New Azure Bots are single-tenant, which means only users in the tenant that
owns the registration can talk to the bot. Microsoft's stated path for ISVs is
to publish the app to the Teams Store (AppSource); a single-tenant bot
published there is installable by any tenant.

Consequences:

- **Twenty Cloud** needs a Partner Center account, a Store submission, and a
  pass through the Teams Store and Agent Store validation guidelines (AI label
  and feedback buttons are policy requirements for agents). Review is iterative
  rather than one wait: Microsoft returns a test report within 24 working hours
  of each submission, categorised into must-fix, good-to-fix and blockers, and
  the cycle repeats until it passes, then at least one business day to appear.
  Total time depends on how many rounds we need, so plan in weeks. Every
  manifest change (new permission, new scope) is a resubmission. Since July 2026
  channel-enabled apps must use manifest schema 1.25 or later, so that binds our
  first submission rather than being a future deadline.
- **Publisher verification is a prerequisite**, and it gates more than the store.
  It needs a verified Microsoft AI Cloud Partner Program account that is the
  partner global account (a location id will not do), the app registered from a
  work account in a tenant associated with that account, and a publisher domain
  that cannot be `*.onmicrosoft.com`, so a DNS-verified company domain is
  required. Whoever runs it needs Application Administrator in Entra and Partner
  Admin or Account Admin in Partner Center, with MFA. Microsoft charges nothing
  and says verification takes minutes once the prerequisites are met; the
  prerequisites are the slow part, with Partner Center account verification
  running about two hours for employment and one to two business days for
  business. This also matters if we skip the store: since November 2020, where
  risk-based step-up consent is enabled, users cannot consent to newly
  registered multi-tenant apps that are not publisher verified, which would
  block the delegated sign-in our connection provider depends on.
- **Self-hosters** cannot use Twenty's bot. Each must create their own Entra
  app registration and Azure Bot (an Azure subscription is required, though
  the Teams channel itself is free), then upload the app package to their own
  tenant via the Teams admin center. That is heavier than pasting a Slack
  manifest, but it is the same shape as our current `SETUP.md`, and it mirrors
  how every self-hosted Teams bot works.
- Worth checking whether Twenty already owns a multi-tenant app registration
  created before the cutoff. Existing multi-tenant bots keep working and would
  let Cloud customers sideload a package without waiting on the Store.

### 2. Connection model: the platform only knows `oauth` (medium)

`defineConnectionProvider` supports one type, `oauth` (authorization code, user
delegated). Teams outbound auth is client credentials with no user in the loop,
and the token is ours, not the tenant's. Two ways through:

- **Recommended for v1: keep `oauth`, point it at Entra.** Authorization
  endpoint `login.microsoftonline.com/common/oauth2/v2.0/authorize`, token
  endpoint likewise, scopes `openid profile email offline_access User.ReadBasic.All`.
  The existing flow supports PKCE plus a client secret, form-encoded token
  requests, and refresh tokens (Entra access tokens live 60 to 90 minutes; the
  platform assumes 60). The `id_token` gives us `tid` to claim the tenant and
  `email` for the handle. The delegated Graph token is a bonus: it lets the
  settings page search the directory and lets the roster sweep cover people who
  have never opened a chat with the bot. The Bot Connector token is minted in
  the logic function from server variables and cached in `kv`.
- **Later, if wanted: a `clientCredentials` provider type.** The shared type
  already anticipates additive types. Not needed to ship.

One small platform nit: `extractEmailFromIdTokenClaims` reads `email` then
`upn`. Entra v2 tokens carry `preferred_username` when `email` is absent.
Adding that fallback is a one-line change.

### 2b. Can the bot read a member's email at all? (unresolved, high impact)

Automatic user linking is what makes the Slack app work without setup for most
people: the bot reads the requester's verified email and matches it to a
workspace member. Whether Teams allows the equivalent is genuinely unresolved.

Microsoft's current guidance says bots cannot proactively retrieve
`userPrincipalName` or `email` for members of a chat or team and must use Graph,
a restriction announced for late 2021 alongside the paged members API. Against
that, the member payload schema still documents both fields, the .NET
`TeamsChannelAccount.UserPrincipalName` property still exists, and 2025 support
answers state that `getMember` returns email so Graph is not needed for it. The
archived v3 documentation showing `email` in the response predates the change and
should not be trusted on this point.

The two outcomes differ in install experience, not in feasibility:

- **Email is available from the bot API.** Auto-linking ports from Slack almost
  unchanged, and the install stays a single sign-in.
- **Email requires Graph.** We either read it from the delegated token the
  connecting admin already grants (works, but only covers directory lookups the
  admin can perform) or request `User.Read.All` as an application permission,
  which needs tenant admin consent at install and makes the app look heavier in
  the store listing.

Resolve this in Phase 0 with a live call in a dev tenant. It is a half-day test
once a bot is reachable, and it decides the shape of the linking flow.

### 3. Inbound verification is a JWT, not an HMAC (medium)

Teams sends `Authorization: Bearer <jwt>`. The public server route forwards
only headers listed in `forwardedRequestHeaders`, with no blocklist, so listing
`authorization` works; this needs a real end-to-end check in a spike because
nothing in the repo forwards that header today. Verification is: RS256, issuer
`https://api.botframework.com`, audience equals our app id, `serviceUrl`
claim equals the activity's `serviceUrl`, 5 minute skew, keys from
`https://login.botframework.com/v1/.well-known/keys` cached under 24 hours
(`kv`, SERVER scope). `jose` handles this in a few lines and bundles cleanly
with esbuild. `serviceUrl` must only be trusted after this check, since we
POST our bot token to it.

### 4. Synchronous invokes vs the async resolver (medium, platform)

The resolver runs in the owner workspace and can either answer synchronously or
dispatch asynchronously to the target workspace; it cannot do both, and it
cannot read the target workspace's records. Teams invokes need a synchronous
answer with content:

- `composeExtension/queryLink` (link unfurling) must return the card within 5
  seconds. The resolver has no access to the record, so a v1 preview can only
  be a generic card built from the URL (object type, "Open in Twenty"). A
  full record card needs a synchronous cross-workspace dispatch in the server,
  which does not exist today.
- Everything else (`message`, `conversationUpdate`, `installationUpdate`) is
  fine: Teams only wants a 200 within 15 seconds and the reply goes out later.

### 5. Feedback invoke wants an empty 200 (low, platform)

The dispatch path answers `{ queued: true }`. Teams documents a 400 when the
`message/submitAction` feedback response body is not empty. Either let a
resolver return a `Response` and a dispatch together, or make the queued ack
body configurable per route. Small change in `server-route-trigger.service.ts`.

### 6. Hearing un-mentioned messages needs RSC consent (medium, product)

Slack's thread follow-ups rely on `message.channels`. In Teams the bot only
receives @mentions and personal chat unless the manifest declares
`ChannelMessage.Read.Group` and `ChatMessage.Read.Chat` under
`authorization.permissions.resourceSpecific`. Team owners consent at install;
tenant admins can disable RSC globally; group chat behaviour has known
inconsistencies. Also, once granted, the bot receives every message in every
channel of the team, not only threads it answered in, so the billing-exempt
list must include the Teams app from day one, as it does for Slack.

### 7. Conversation model differences (medium, design)

Personal chats have no threads: the entire 1:1 chat is one conversation, so
"thread memory" becomes "recent turns in this chat" with an explicit window.
Channel posts are threaded, but replies come in with a compound conversation
id that embeds the parent message id. Adaptive Cards replace Block Kit, and
plain `text` supports only a markdown subset, so the reply renderer is new.
Streaming exists (REST, one update per second, two minute cap, personal chat
only) but `runAgent` returns a full result today, so v1 uses typing and
informative updates and streams later.

### 8. Tooling and testing (low)

Teams needs a public HTTPS endpoint to develop against (dev tunnel or ngrok)
and a Microsoft 365 developer tenant. The Bot Framework Emulator is archived.
There is no official mock of the Bot Connector, so we replicate the Slack
approach: an MSW fake for `smba.trafficmanager.net`, plus a fake JWKS signed
with a test keypair so the resolver's verification runs for real in CI.

### 9. Operational details (low)

Entra client secrets expire (24 months max), so `SETUP.md` needs a rotation
note. `serviceUrl` is regional and can change, so store it per conversation
and refresh from each inbound activity. Government clouds are out of scope for
v1.

## Roadmap

### Phase 0: spikes (1 to 2 weeks)

Goal: retire the unknowns before writing product code.

- Deploy a throwaway resolver via a dev tunnel, forward `authorization`, verify
  a real Teams JWT with `jose`, reply through the connector. This proves
  Blocker 3 end to end and tells us whether `serverRouteTriggerSettings` needs
  anything.
- Run the Entra delegated flow through `ConnectionProviderOAuthFlowService`
  against a dev tenant: PKCE plus secret, `id_token` claims, refresh.
- Bundle `@microsoft/teams.api` versus plain `fetch` through the SDK's esbuild
  step and pick one.
- Confirm whether the bot member API returns `email` in a live tenant
  (Blocker 2b). Half a day, and it decides the linking flow.
- Decide the Cloud distribution path: confirm whether a pre-2025 multi-tenant
  registration exists, otherwise open the Partner Center account now so it is
  not on the critical path later.
- Start publisher verification in parallel. It is free and fast once the
  prerequisites are met, but those need a partner global account, a
  DNS-verified company domain on the tenant, and someone holding both the Entra
  and Partner Center admin roles.

### Phase 1: platform changes (1 to 2 weeks, `twenty-server`)

- Resolver may return a `Response` alongside a dispatch, or a configurable
  queued-ack body (Blocker 5).
- `preferred_username` fallback in `extractEmailFromIdTokenClaims` (Blocker 2).
- Optional, not blocking: synchronous cross-workspace dispatch for invokes
  (Blocker 4). Skip for v1.

### Phase 2: Teams app MVP (3 to 4 weeks, `packages/twenty-apps/public/teams`)

Same folder layout and file conventions as the Slack app.

- `application.config.ts` with server variables `TEAMS_APP_ID`,
  `TEAMS_APP_SECRET`, `TEAMS_APP_TENANT_ID` (bot identity) and the Entra
  client id and secret for the delegated connection (can be the same
  registration).
- Connection provider (Entra, delegated). `onConnect` claims the tenant from
  `tid`, links the installer by email, sweeps the directory. `onDisconnect`
  releases the claim.
- `teams-activities-resolver`: JWT verification, tenant to workspace, routing
  by activity type. `installationUpdate remove` releases the claim.
- `teams-events-enqueue` writes a `teamsAssistantRequest` record; the worker
  is the Slack worker with the transport swapped: same run-as resolution,
  deadline race, failure replies, feedback rating fields.
- Connector client: token minting and caching, send, update, delete, reply in
  thread, typing, create personal conversation, list channels, get member.
- Reply rendering: markdown-to-Teams text, Adaptive Card fallback for long
  answers, AI label, feedback buttons, record links.
- Workflow tools: post message (channel, personal, thread), update, delete,
  list teams, list channels.
- `teamsUserLink` object, email matching, consent conversation, settings
  component ported from the Slack components.
- App package: manifest (bots, scopes, `commandLists` prompt starters,
  `validDomains`, RSC permissions), icons, `SETUP.md` for self-hosters.
- Tests: unit plus MSW integration suite with a fake connector and fake JWKS.

### Phase 3: parity features (2 to 3 weeks)

- Channel welcome on `conversationUpdate`.
- Feedback invoke stored on the request record (needs Phase 1).
- Link unfurling with a generic card via `composeExtensions.messageHandlers`;
  the full record card waits on synchronous dispatch.
- Reactions (Teams agent reactions API).
- Un-mentioned follow-ups behind RSC, with the same 24 hour window semantics
  where threads exist.
- `copilotAgents.customEngineAgents` in the manifest so the bot appears in
  Copilot Chat.
- Streaming, once `runAgent` can stream.

### Phase 4: release (Cloud: 4 to 6 weeks of calendar time, mostly waiting)

- Add the app to `MARKETPLACE_BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS`.
- Store submission with manifest 1.25+, listing copy, privacy and terms URLs,
  test tenant instructions for the validators. Budget one resubmission.
- Self-host docs reviewed against a clean tenant.
- Vet and tag 1.0.0, as done for Slack in twentyhq/twenty#25214.

## Sources

- Bot Connector authentication (token endpoints, the seven JWT checks):
  https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-connector-authentication
- Multi-tenant bot deprecation after 2025-07-31:
  https://learn.microsoft.com/en-us/azure/bot-service/bot-builder-authentication
- Single-tenant bots and the Store as the ISV path:
  https://techcommunity.microsoft.com/discussions/teamsdeveloper/what-is-the-recommended-bot-type-for-multi-tenant-bots/4420239
- RSC permissions for all channel and chat messages:
  https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/conversations/channel-messages-for-bots-and-agents
- Member endpoint response shape (archived v3 doc, predates the 2021 change, do
  not rely on it for email availability):
  https://learn.microsoft.com/en-us/previous-versions/microsoftteams/platform/resources/bot-v3/bots-context
- Bot member API changes removing proactive email and UPN:
  https://learn.microsoft.com/en-us/microsoftteams/platform/resources/team-chat-member-api-changes
- Publisher verification requirements and cost:
  https://learn.microsoft.com/en-us/entra/identity-platform/publisher-verification-overview
- Partner Center account verification timings:
  https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/appsource/prepare/create-partner-center-dev-account
- AI label, citations, feedback buttons:
  https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/bot-messages-ai-generated-content
- Streaming (personal chat only, REST contract):
  https://learn.microsoft.com/en-us/microsoftteams/platform/bots/streaming-ux
- Rate limits: https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/rate-limit
- Link unfurling and the 5 second invoke window:
  https://learn.microsoft.com/en-us/microsoftteams/platform/messaging-extensions/how-to/link-unfurling
- Custom engine agents and manifest 1.21+:
  https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/overview-custom-engine-agent
- Store publishing timelines and the 1.25 manifest requirement:
  https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/appsource/publish
- Custom app upload: https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/apps-upload
- Bot Framework SDK retirement and successor SDKs:
  https://learn.microsoft.com/en-us/azure/bot-service/bot-service-overview
