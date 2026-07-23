# Slack for Twenty

Slack tools for **Twenty workflows** and **agents** — the same logic functions
are available as workflow steps and as tools where your deployment exposes
them.

## What you can do

Once the app is installed and Slack is **connected** (see **Twenty setup**
below):

- **Workflow steps** — post, update, or delete bot messages; send ephemerals;
  add reactions; list channels. Pick a **workspace shared** or **just for me**
  connection; steps run with that token.
- **Agents / AI** — when your Twenty instance surfaces app tools to the model,
  these functions can be invoked the same way as other app logic functions.
- **Quick-send** — command menu **Send Slack message** opens a side panel to
  pick a channel and post (same Slack connection as workflows).
- **Conversational assistant** — mention the bot in a channel (or DM it) to ask
  about your CRM or make changes, e.g. `@twenty how many open opportunities do
  we have?` or `@twenty create a company called ACME`. The assistant is powered
  by the **`slack-assistant`** agent (this app) and the Twenty server's chat
  runtime, and answers in the thread. Once it has replied in a thread it stays
  active there, so follow-up messages in that thread are answered **without
  re-mentioning** the bot. Channel threads stay active for **24 hours after the
  last reply** (each reply renews the window); after a full day of silence,
  re-mention the bot to continue. Direct-message threads never expire. Replies
  are answered with the thread's recent history as context, so the assistant
  follows up coherently across turns. It requires the extra setup below (signing
  secret + event subscriptions); the agent's CRM role is assigned automatically
  on install.

## Tools

| Name | Slack API |
|------|-----------|
| `slack-post-message` | `chat.postMessage` |
| `slack-post-ephemeral-message` | `chat.postEphemeral` |
| `slack-update-message` | `chat.update` |
| `slack-delete-message` | `chat.delete` |
| `slack-add-reaction` | `reactions.add` |
| `slack-list-channels` | `conversations.list` |

### Workflow field names (for authors)

Fields use camelCase names in the step UI, for example **`slackChannelId`** (Slack channel or DM: **name** or **ID**), **`messageText`**, and **`messageTimestamp`** (Slack’s per-message id — same value as tool output **`slackTs`** when chaining steps). Optional **`parentMessageTimestamp`** is only for **thread replies**. Post / update / ephemeral steps support optional **`messageFormat`**: **`markdown`** sends the body as Slack **`markdown_text`** (e.g. **`**bold**`**), **`plain`** sends **`text`** with markup disabled, omit uses Slack’s default for **`text`**. Ephemeral steps use **`recipientSlackUserId`**; reactions use **`emojiName`** (Slack shortcode, for example `white_check_mark`). Updating a message uses **`newMessageText`**.

### Quick-send command menu item

This app also ships a global command menu item — **Send Slack message** — that opens a side-panel form to pick a channel (from `conversations.list`) and post a message via `chat.postMessage`. The form is backed by two HTTP routes exposed by the app:

- `GET /slack/channels` — lists channels visible to the bot (mirrors `slack-list-channels`).
- `POST /slack/messages` — posts a message (mirrors `slack-post-message`).

Both routes require an authenticated Twenty user and use the same shared Slack connection as the workflow tools.

### Prerequisites (Slack workspace)

- You can **install** the Slack app on a workspace you administer (or get an
  admin to approve it).
- For **posting**: invite the bot to the channel, **or** rely on
  **`chat:write.public`** (included in OAuth) to post to **public** channels
  without joining — private channels still require membership.
- **`slack-list-channels`** and the quick-send channel picker need
  **`channels:read`** / **`groups:read`** on the token (requested at connect
  time; see below).

## Slack app setup

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps)
   (dedicated to this Twenty app — do not reuse for other Twenty apps).
2. **OAuth & Permissions** → **Bot Token Scopes**. Twenty uses Slack’s **bot**
   OAuth (`oauth/v2/authorize` with `scope=…`). You must add scopes here — not
   only under **User Token Scopes** — or Slack will refuse install with *“doesn’t
   have a bot user to install”* until at least one bot scope exists.

   The scopes **requested at connect time** must also appear under
   **Bot Token Scopes** on the Slack app (Slack validates the set). Current
   list:

   - `channels:read` — `conversations.list` / channel picker (public)
   - `chat:write` — post, update, delete, ephemeral
   - `chat:write.public` — post to public channels without the bot joining
   - `groups:read` — list private channels the bot is in
   - `reactions:write` — add reactions

   If you **add or remove** scopes for this app or in the Slack app, existing
   installs must **re-authorize** (disconnect and **Add connection** again, or
   reinstall the Slack app to the workspace) so the token picks up new scopes.

3. Set the **Redirect URL** on the Slack app to
   `<YOUR_TWENTY_SERVER_URL>/auth/apps/callback` — the same origin your
   Twenty **server** uses for API routes (the callback is not served by the SPA
   alone). Local monorepo dev often uses `http://localhost:3000` (confirm the
   port your `twenty-server` / `SERVER_URL` actually uses).

   **Slack “PKCE” app setting vs `localhost`:** If you turn on **PKCE** for the
   Slack app under **OAuth & Permissions**, Slack treats `http://localhost…`
   redirect URLs as **desktop** redirects. **Desktop redirects cannot request
   bot scopes**, so OAuth will fail for this integration while you use a
   localhost callback. For local dev you can either **leave Slack’s PKCE
   opt-in disabled** on that Slack app, or use an **`https://` redirect** (for
   example a tunnel such as ngrok or Cloudflare Tunnel to your local server),
   register that URL in the Slack app, and point Twenty’s `SERVER_URL` at the
   same public base URL. See Slack’s [Using
   PKCE](https://docs.slack.dev/authentication/using-pkce) docs (this is
   separate from Twenty sending a PKCE challenge on the authorize request).

4. Copy the Slack **Client ID** and **Client Secret**.

## Twenty setup

1. Register / install this app on your Twenty server (`twenty-slack`).
2. In **Settings → Applications → Twenty Slack**, open the **Application registration**
   tab (admin-only) and set:
   - `SLACK_CLIENT_ID`
   - `SLACK_CLIENT_SECRET`
3. In the same app, open the **Connections** tab and click **Add connection**.
   Choose **Just for me** or **Workspace shared**, then complete the Slack sign-in.

Once connected, workflow steps use the connection access token: a
**workspace** connection is preferred when present; otherwise the first
connection returned for the Slack provider is used.

## Conversational assistant setup

The assistant reuses the **same Slack connection** as the tools above — it does
not add a second connection or bot identity. To enable it:

1. **Add the assistant scopes.** This app now requests the inbound scopes
   `app_mentions:read`, `channels:history`, `groups:history`, and `im:history`
   (in addition to the outbound scopes). Add them under **Bot Token Scopes** on
   your Slack app, then **reconnect** (disconnect and **Add connection** again)
   so the token picks them up.
2. **Set `SLACK_WEBHOOK_SIGNATURE`.** In **Application registration** (admin-only),
   set the signing secret from your Slack app (**Basic Information → App
   Credentials**). The Twenty server uses it to verify Slack Events API
   requests. This is only needed for the assistant.
3. **Point Slack Events at Twenty.** On your Slack app, enable **Event
   Subscriptions** and set the Request URL to
   `<YOUR_TWENTY_SERVER_URL>/webhooks/slack/events`. Slack signs this handshake,
   so `SLACK_WEBHOOK_SIGNATURE` (step 2) must be set first or verification returns
   401 and Slack reports *"didn't respond with the value of the challenge
   parameter."* Under **Subscribe to bot events**, add:
   - `app_mention` — mentions of the bot in a channel.
   - `message.im` — direct messages to the bot.
   - `message.channels` — replies in public-channel threads (needed for
     un-mentioned follow-ups; the bot only answers threads it already joined).
   - `message.groups` — same, for private channels the bot is a member of.

   Invite the bot to any channel where you want it to follow threads. After
   changing event subscriptions, Slack may require you to reinstall the app.
4. **Agent role (assigned automatically).** When the app is installed (or
   upgraded to a version that adds the assistant), the app's **Slack Assistant**
   role (read-only CRM access) is granted to the **`slack-assistant`** agent by
   a background job, so it works out of the box with no manual step. To let it
   create or update records, widen that role to include write permissions; a
   role you assign or edit is always kept and never overridden.

The permission boundary is the agent's role: anyone who can message the bot
acts with that role's permissions (Slack users are not yet mapped to individual
Twenty members). Keep the role scoped to what you're comfortable exposing.
