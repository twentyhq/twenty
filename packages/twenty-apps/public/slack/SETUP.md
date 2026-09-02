# Slack — Self-hosting setup

This guide is for Twenty **server admins**. It covers creating the Slack app
Twenty connects to, the server variables it reads, and the extra wiring the
conversational assistant needs.

If you're on **Twenty Cloud**, these credentials may already be configured —
check with your workspace before setting them.

## What you need to wire up

Twenty connects to a **Slack app that you create and own**. Three things must be
configured:

1. A **Slack app** with the right bot scopes and redirect URL, so workspaces can
   authorize it.
2. Its **client ID and secret**, set as server variables on the Twenty
   application registration.
3. For the conversational assistant, a **signing secret**, **event
   subscriptions** and **interactivity**, so Slack can reach your deployment.

Use a dedicated Slack app — do not reuse one across Twenty apps.

## Creating the Slack app

Create it at [api.slack.com/apps](https://api.slack.com/apps) → **Create New App
→ From a manifest**, pasting [`slack-app-manifest.json`](./slack-app-manifest.json)
with the `https://<your-twenty-host>` placeholders replaced by your deployment's
server origin. The manifest is the source of truth for scopes, event
subscriptions and the agent surface, so an app created from it only needs its
credentials copied out (below).

The manifest enables `agent_view`, Slack's Agent messaging experience: the app
is listed as an agent in Slack's UI, shows clickable suggested prompts at the
top of its Messages tab, and replies show a native thinking status instead of
placeholder messages, in DMs and channel threads alike. On an app configured by
hand instead, enable **Agents & AI Apps** in the app settings, which also adds
the `assistant:write` scope.

### Bot token scopes

Twenty uses Slack's bot OAuth (`oauth/v2/authorize` with `scope=…`), so scopes
must be added under **OAuth & Permissions → Bot Token Scopes** and not only
under **User Token Scopes**. Every scope requested at connect time must appear
there, since Slack validates the set:

| Scope | Used for |
|---|---|
| `channels:read` | `conversations.list` and the channel picker (public channels) |
| `chat:write` | post, update, delete, ephemeral |
| `chat:write.public` | post to public channels without the bot joining |
| `groups:read` | list private channels the bot is in |
| `im:write` | open a DM with a member to ask for their consent to a manual link |
| `reactions:write` | add reactions |
| `app_mentions:read` | assistant: mentions of the bot |
| `channels:history` | assistant: thread follow-ups in public channels |
| `groups:history` | assistant: thread follow-ups in private channels |
| `im:history` | assistant: direct messages |
| `im:read` | assistant: confirm with Slack that a conversation really is a direct message |
| `users:read` | list the Slack roster for the email sweep, and look up a requester's display name |
| `users:read.email` | match a Slack account to a workspace member by confirmed email |
| `assistant:write` | agent surface: `assistant.threads.*` (statuses, titles, suggested prompts) |

Adding or removing scopes later means existing installs must re-authorize:
disconnect and **Add connection** again.

### Redirect URL

Set it to the origin your Twenty **server** uses for API routes, not the SPA:

```text
https://<your-twenty-host>/auth/apps/callback
```

Local monorepo dev is usually `http://localhost:3000` — confirm the port
`twenty-server` / `SERVER_URL` actually uses.

> **Do not enable Slack's PKCE opt-in.** The manifest leaves it off, and it
> should stay off. Turning it on marks the app a **public client**, which is
> one-way and reversible only by Slack support, and Twenty always sends the
> client secret on the token exchange, so a public-client app is liable to have
> that exchange rejected. It also makes Slack treat `http://localhost…` as a
> *desktop* redirect, and desktop redirects cannot request bot scopes, which
> breaks local dev outright. See Slack's
> [Using PKCE](https://docs.slack.dev/authentication/using-pkce) docs.
>
> This is separate from Twenty sending a PKCE challenge on the authorize
> request, which it does regardless of this setting.

## Server variables

Set these on the application registration after installing (**Settings →
Applications → Slack → Application registration**, admin only). The client ID
and secret are on the Slack app's **Basic Information → App Credentials** page,
alongside the signing secret.

| Server variable | Required | Purpose |
|---|---|---|
| `SLACK_CLIENT_ID` | Yes | OAuth client ID of your Slack app. Public in OAuth flows. |
| `SLACK_CLIENT_SECRET` | Yes | OAuth client secret of your Slack app. Stored encrypted and never exposed in API responses. |
| `SLACK_WEBHOOK_SECRET` | Assistant only | Slack signing secret, used to verify every Slack Events and interactivity request. Only needed if you enable the conversational assistant. |

## Connecting a workspace

1. Install this app (`slack`) from the app store.
2. Set the server variables above.
3. **Connections → Add connection**, choose **Just for me** or **Workspace
   shared**, and complete the Slack sign-in.

Workflow steps then use that connection's access token: a workspace connection
is preferred when present, otherwise the first connection returned for the Slack
provider. For posting, either invite the bot to the channel or rely on
`chat:write.public` for public channels. Private channels always require
membership.

## The conversational assistant

The assistant reuses the same Slack connection — there is no second bot
identity. Set `SLACK_WEBHOOK_SECRET` first: Slack signs the subscription
handshake, and without it Slack reports *"didn't respond with the value of the
challenge parameter."*

### Event subscriptions

Enable **Event Subscriptions** on the Slack app and set the Request URL to the
`slack-events-resolver` logic function:

```text
https://<your-twenty-host>/webhooks/server/9ad6fa20-dff5-4d3f-ad5f-084f3c8b0b09
```

Under **Subscribe to bot events**, add:

- `app_home_opened` — a user opened the bot's Messages tab; sets the suggested prompts
- `app_mention` — mentions of the bot in a channel
- `message.im` — direct messages to the bot
- `message.channels` — replies in public-channel threads, for un-mentioned follow-ups
- `message.groups` — same, for private channels the bot is in
- `member_joined_channel` — optional; lets the bot introduce itself when it is added to a channel
- `app_uninstalled` and `tokens_revoked` — the app was removed from the Slack workspace or its bot token was revoked; releases the Slack team claim so the team can be connected again

Invite the bot to any channel where it should follow threads. Slack may ask you
to reinstall after changing subscriptions.

`message.channels` and `message.groups` deliver every message posted in the
channels the bot belongs to, not only the ones aimed at it, and each delivery
costs a logic function invocation. Leave both off to limit the bot to explicit
mentions and DMs, at the cost of un-mentioned thread follow-ups.

> Event subscriptions added in app upgrades must be added here by hand on
> existing installs — the Slack app only reads the manifest at creation.
> Upgrading from any version before 0.4.1 adds `app_uninstalled` and
> `tokens_revoked`; without them the team claim survives a Slack-side removal.
> No new scopes are involved, so the connection itself needs no re-authorization.

### Interactivity

Enable **Interactivity & Shortcuts** and set the Request URL to the
`slack-interactivity-resolver` logic function:

```text
https://<your-twenty-host>/webhooks/server/fd756b00-50a2-4816-a919-a1a959a2ed9a
```

It powers the thumbs up / thumbs down feedback buttons under assistant answers,
verified with the same `SLACK_WEBHOOK_SECRET`. Apps created from the manifest
have this preconfigured; on an app configured by hand, the buttons show a
warning when clicked until you enable it.

Once both are set, **reconnect** so the token picks up the assistant scopes.

### Permissions

The `slack-assistant` agent binds to the app's **Slack Assistant** role
automatically on install and upgrade. That role is the ceiling for everything
the bot can do.

Where a Slack account is linked to a workspace member, the bot also runs with
that member's own permissions, so it can never do more than the person asking.
Accounts with no link act with the Slack Assistant role alone, so keep it scoped
to what you're comfortable exposing to anyone who can message the bot.

## Linking Slack accounts to workspace members

Connecting the Slack workspace links the installer, then sweeps the rest of the
roster and links every full member whose confirmed Slack email matches a
workspace member's, so most people are linked before anyone messages the bot.
Anyone the sweep missed is matched the first time they mention the bot, the same
way. Each pair is stored as a **Slack User Link** record.

The sweep is deliberately narrow. It trusts only a confirmed email on a full
member of the installed Slack workspace, never a guest, a Slack Connect user or
a bot; it skips any Slack account that already has a link, whatever its state,
so it cannot revive a declined consent or overwrite a hand-made mapping; and it
treats an email shared by two workspace members as ambiguous and links neither.
Slack rate-limits the roster listing, so a large workspace may be read only in
part, and the result says so when it was cut short.

A link matched on email is re-verified on every request: the bot rechecks that
the Slack account's current verified email still points at the same member, and
follows the live match rather than the stored record if they disagree. The
record is an audit trail, not the source of truth.

Only members of the Slack workspace that installed the app are matched
automatically. Guests and Slack Connect users from another Slack workspace are
not, because their email is vouched for by someone other than your admin. A
member with the roles permission links them by hand from the **Slack user
links** section of the app's **Settings** tab, or by asking the assistant to
link a Slack user to a workspace member; either way the pair is stored with its
source set to manual. A guest or Slack Connect user whose email is not in your
workspace is linked by their Slack user ID instead; for a Slack Connect user,
include their own Slack workspace's team ID so the link matches the messages
they send.

Whether a manual link needs the person's approval depends on who it points at:

- **A matching email needs no approval.** Linking a Slack account to the
  workspace member with the same email is just the automatic match set up ahead
  of that person's first message, so it is stored as an email-matched link and
  is active immediately, with the same live re-verification.
- **Any other link asks the person first.** When you link someone who is in the
  installed Slack workspace to a member with a different email, the app DMs them
  explaining that an admin wants the assistant to act with a workspace member's
  access, with **Approve** and **Decline** buttons. The link stays inactive
  (shown as *Awaiting consent*) until they approve, and a decline keeps it off.
  Sending that DM needs the `im:write` scope, so reconnect after upgrading from
  a version that did not request it.
- **Guests and Slack Connect users cannot be DMed** this way, so their link is
  admin-set and active on save, labelled as such.

A consented or admin-set manual link wins over email matching. Slack User Link
records can only be written by the app itself, never directly through the API or
the UI, so a manual link always reflects both an admin's decision and, where
possible, the person's consent.

The Settings section searches members by name so there is no need to paste a
member ID, searches the Slack workspace by name or email the same way, and
spells out next to the save button whether saving activates the link
immediately or sends an approval request. It lists existing links with their
status, lets a member with the permission remove a link or resend a pending
consent request, and shows a read-only view to anyone without the permission.
It renders nothing until Slack is connected.

The same section lists Slack users with no link yet, so you can see who the
sweep skipped and finish the job in place: each row has its own member picker
and says whether linking activates immediately or asks the person first. An
**Auto-link by email** button reruns the sweep on demand, which is how you cover
a workspace that connected before the sweep existed (connect hooks do not
re-fire) and people who joined Slack after connection.

## Behaviour notes

- **Suggested prompts.** With `app_home_opened` subscribed and the Agents
  feature enabled, opening the bot's Messages tab shows clickable example
  prompts, refreshed on every open.
- **Direct messages.** Each new message in the bot's Messages tab starts its own
  conversation thread: the bot shows a "Twenty is thinking…" status while it
  works, replies in the thread, and titles the thread after the question.
  Context is scoped to the thread, not the whole DM history.
- **Channel mentions.** The bot shows its thinking status in the mention's
  thread and posts its answer as a thread reply. The status is only visible with
  the thread open, so the channel stays quiet until the answer arrives.
- **Answer feedback.** Short answers end with Slack's native thumbs up / thumbs
  down buttons. A click stores a Positive or Negative rating on the matching
  Slack Assistant Request record (last click wins). Very long answers fall back
  to a plain markdown message without buttons.
- **Thread memory.** After a successful reply the bot stays active in that
  thread, so follow-ups need no mention. Channel threads stay active for 24
  hours after the last reply (each reply renews it); DM threads never expire.
- **No silent dead-ends.** A mention or DM with no request text gets a short
  hint reply. The first follow-up in a thread whose 24-hour window has lapsed
  gets an ephemeral nudge (only that member sees it) to mention the bot again.
- **Channel welcome.** With `member_joined_channel` subscribed, the bot posts a
  short introduction the first time it is added to a channel, with the details
  in a thread reply so the channel itself stays quiet. It fires once per channel
  for 30 days, and only for the bot's own join — humans joining afterwards
  trigger nothing. Skip the subscription if you would rather it arrived
  silently.
- **One Slack workspace per Twenty workspace.** Connecting Slack claims that
  Slack team for the connecting Twenty workspace, and on the same server a
  second Twenty workspace connecting the same team is rejected. Removing the
  connection releases the claim, and so does uninstalling the app or removing it
  on the Slack side — with `app_uninstalled` and `tokens_revoked` subscribed,
  Slack reports the removal and the claim is released. The dead connection still
  shows under **Connections** until you remove it; reconnecting means removing
  it and adding a new one.

## Workflow field names

Fields use camelCase in the step UI:

- `slackChannelId` — channel or DM, name or ID
- `messageText`, `newMessageText` — body to post / the replacement on update
- `messageTimestamp` — Slack's per-message id, same value as the tool output `slackTs` when chaining steps
- `parentMessageTimestamp` — thread replies only
- `messageFormat` — `markdown` sends the body as Slack `markdown_text` (`**bold**`), `plain` sends `text` with markup disabled, omitted uses Slack's default for `text`
- `recipientSlackUserId` — ephemeral steps
- `emojiName` — Slack shortcode, for example `white_check_mark`

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Slack refuses the install with *"doesn't have a bot user to install"* | Scopes were added under **User Token Scopes** only | Add every scope from the table above under **Bot Token Scopes**, then reconnect |
| OAuth fails from a `localhost` redirect | Slack's PKCE opt-in is on, so Slack treats the redirect as a desktop one and refuses bot scopes | Leave the PKCE opt-in off (it cannot be turned off again once set), or use an `https://` redirect and point `SERVER_URL` at the same base URL |
| Slack reports *"didn't respond with the value of the challenge parameter"* | `SLACK_WEBHOOK_SECRET` is not set, so the handshake fails signature verification | Set it on the application registration, then re-save the Request URL |
| The bot answers mentions but ignores thread follow-ups | `channels:history` / `groups:history` missing, the bot isn't in the channel, or the 24-hour window lapsed | Confirm the subscriptions and scopes, invite the bot, and mention it again to reopen the thread |
| Feedback buttons show a warning when clicked | **Interactivity & Shortcuts** is not enabled, or its Request URL is wrong | Enable it and set the `slack-interactivity-resolver` URL above |
| Connecting is rejected because the Slack team is already claimed | Another Twenty workspace on this server has connected the same Slack team | Remove the connection on that workspace, or uninstall the app there, to release the claim |
| A manual link stays *Awaiting consent* | The person has not answered the consent DM, or `im:write` was not granted so it was never sent | Resend the request from the **Slack user links** settings section; if nothing arrives, reconnect to grant `im:write` |
| The bot acts with the Slack Assistant role instead of the member's permissions | The Slack account has no link, or its verified email no longer matches the member | Check the link's status in the settings section and link the account by hand if the email cannot match |
