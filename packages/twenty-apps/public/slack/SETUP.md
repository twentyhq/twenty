# Setup

Two parts: a **Slack app** you create, and the **Twenty side** where you paste its credentials and connect. The conversational assistant needs a third part on top.

## 1. Slack app

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps) → **Create New App → From a manifest**, pasting [`slack-app-manifest.json`](./slack-app-manifest.json) with both `<YOUR_TWENTY_SERVER_URL>` placeholders replaced. The manifest is the source of truth for scopes, event subscriptions and the agent surface — the steps below describe what it configures, so an app created from it only needs credentials copied (step 4). Use a dedicated app — do not reuse one across Twenty apps.

   The manifest enables `agent_view` (Slack's Agent messaging experience): the app is listed as an agent in Slack's UI, shows clickable suggested prompts at the top of its Messages tab, and replies show a native thinking status instead of placeholder messages, in DMs and channel threads alike. On an app configured by hand instead, enable **Agents & AI Apps** in the app settings, which also adds the `assistant:write` scope.

2. **OAuth & Permissions → Bot Token Scopes.** Twenty uses Slack's bot OAuth (`oauth/v2/authorize` with `scope=…`), so scopes must be added here and not only under **User Token Scopes**, otherwise Slack refuses the install with *"doesn't have a bot user to install"*.

   The scopes requested at connect time must all appear under **Bot Token Scopes** (Slack validates the set):

   | Scope | Used for |
   |-------|----------|
   | `channels:read` | `conversations.list` and the channel picker (public channels) |
   | `chat:write` | post, update, delete, ephemeral |
   | `chat:write.public` | post to public channels without the bot joining |
   | `groups:read` | list private channels the bot is in |
   | `reactions:write` | add reactions |
   | `app_mentions:read` | assistant: mentions of the bot |
   | `channels:history` | assistant: thread follow-ups in public channels |
   | `groups:history` | assistant: thread follow-ups in private channels |
   | `im:history` | assistant: direct messages |
   | `users:read` | assistant: look up the requester's display name |
   | `assistant:write` | agent surface: `assistant.threads.*` (statuses, titles, suggested prompts) |

   Adding or removing scopes later means existing installs must re-authorize: disconnect and **Add connection** again.

3. **Redirect URL.** Set it to `<YOUR_TWENTY_SERVER_URL>/auth/apps/callback` — the origin your Twenty **server** uses for API routes, not the SPA. Local monorepo dev is usually `http://localhost:3000` (confirm the port `twenty-server` / `SERVER_URL` actually uses).

   **PKCE and `localhost`:** if you enable **PKCE** on the Slack app, Slack treats `http://localhost…` as a *desktop* redirect, and desktop redirects cannot request bot scopes — OAuth will fail. For local dev either leave Slack's PKCE opt-in disabled, or use an `https://` redirect (ngrok, Cloudflare Tunnel), register it in the Slack app, and point `SERVER_URL` at the same base URL. See Slack's [Using PKCE](https://docs.slack.dev/authentication/using-pkce) docs. This is separate from Twenty sending a PKCE challenge on the authorize request.

4. Copy the **Client ID** and **Client Secret**.

## 2. Twenty

1. Install this app (`slack`) on your Twenty server.
2. **Settings → Applications → Twenty Slack → Application registration** (admin only), set `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET`.
3. **Connections → Add connection**, choose **Just for me** or **Workspace shared**, complete the Slack sign-in.

Workflow steps then use that connection's access token: a workspace connection is preferred when present, otherwise the first connection returned for the Slack provider.

For posting, either invite the bot to the channel or rely on `chat:write.public` for public channels. Private channels always require membership.

## 3. Conversational assistant

The assistant reuses the same Slack connection — no second bot identity.

1. **Signing secret.** In **Application registration**, set `SLACK_WEBHOOK_SECRET` from your Slack app (**Basic Information → App Credentials**). The server verifies every Slack Events request with it.

2. **Event subscriptions.** On the Slack app, enable **Event Subscriptions** and set the Request URL to:

   ```text
   <YOUR_TWENTY_SERVER_URL>/webhooks/server/9ad6fa20-dff5-4d3f-ad5f-084f3c8b0b09
   ```

   That ID is the `slack-events-resolver` logic function. Slack signs the handshake, so `SLACK_WEBHOOK_SECRET` must be set first or Slack reports *"didn't respond with the value of the challenge parameter."*

   Under **Subscribe to bot events**, add:

   - `app_home_opened` — a user opened the bot's Messages tab; sets the suggested prompts
   - `app_mention` — mentions of the bot in a channel
   - `message.im` — direct messages to the bot
   - `message.channels` — replies in public-channel threads, for un-mentioned follow-ups
   - `message.groups` — same, for private channels the bot is in
   - `member_joined_channel` — optional; lets the bot introduce itself when it is added to a channel

   Invite the bot to any channel where it should follow threads. Slack may ask you to reinstall after changing subscriptions.

3. **Reconnect** so the token picks up the assistant scopes.

4. **Role.** The `slack-assistant` agent binds to the app's **Slack Assistant** role automatically on install and upgrade. Anyone who can message the bot acts with that role — Slack users are not mapped to individual Twenty members yet, so keep the role scoped to what you're comfortable exposing.

## Behaviour notes

- **Suggested prompts.** With `app_home_opened` subscribed and the Agents feature enabled, opening the bot's Messages tab shows clickable example prompts, refreshed on every open.
- **Direct messages.** Each new message in the bot's Messages tab starts its own conversation thread: the bot shows a "Twenty is thinking…" status while it works, replies in the thread, and titles the thread after the question. Conversation context is scoped to the thread, not the whole DM history.
- **Channel mentions.** The bot marks the mention with an eyes reaction (the thinking status is only visible inside the thread), shows the thinking status there, and posts its answer as a thread reply.
- **Thread memory.** After a successful reply the bot stays active in that thread, so follow-ups need no mention. Channel threads stay active for 24 hours after the last reply (each reply renews it); DM threads never expire.
- **Channel welcome.** With `member_joined_channel` subscribed, the bot posts a short introduction the first time it is added to a channel, with the details (what to ask it, what it reads, and the shared-role caveat from step 4 above) in a thread reply so the channel itself stays quiet. It fires once per channel for 30 days, and only for the bot's own join — humans joining afterwards trigger nothing. Skip the subscription if you would rather it arrived silently.
- **One Slack workspace per Twenty workspace.** Connecting Slack claims that Slack team for the connecting Twenty workspace. On the same server, a second Twenty workspace connecting the same Slack team is rejected. Removing the connection releases the claim, so another Twenty workspace can then connect that Slack team. Uninstalling the app releases it too.

## Workflow field names (for step authors)

Fields use camelCase in the step UI:

- `slackChannelId` — channel or DM, name or ID
- `messageText`, `newMessageText` — body to post / the replacement on update
- `messageTimestamp` — Slack's per-message id, same value as the tool output `slackTs` when chaining steps
- `parentMessageTimestamp` — thread replies only
- `messageFormat` — `markdown` sends the body as Slack `markdown_text` (`**bold**`), `plain` sends `text` with markup disabled, omitted uses Slack's default for `text`
- `recipientSlackUserId` — ephemeral steps
- `emojiName` — Slack shortcode, for example `white_check_mark`

## HTTP routes

The **Send Slack message** command menu item is backed by two app routes, both requiring an authenticated Twenty user and using the same Slack connection as the workflow steps:

- `GET /slack/channels` — lists channels visible to the bot
- `POST /slack/messages` — posts a message
