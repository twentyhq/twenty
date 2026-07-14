# Slack for Twenty

Slack tools for **Twenty workflows** and **agents**, plus a conversational
**assistant**: mention the bot (or DM it) in Slack and an AI agent answers
using your Twenty workspace data.

## What you can do

Once the app is installed and Slack is **connected** (see **Twenty setup**
below):

- **Assistant** — `@twenty how many open opportunities do we have?` or
  `@twenty create a company called ACME` in a channel the bot is in, or the
  same in a DM. The bot replies in the thread after running the **Slack
  Assistant** agent against your workspace. Requires the extra setup in
  **Assistant setup** below.
- **Workflow steps** — post, update, or delete bot messages; send ephemerals;
  add reactions; list channels. Pick a **workspace shared** or **just for me**
  connection; steps run with that token.
- **Agents / AI** — when your Twenty instance surfaces app tools to the model,
  these functions can be invoked the same way as other app logic functions.
- **Quick-send** — command menu **Send Slack message** opens a side panel to
  pick a channel and post (same Slack connection as workflows).

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

   - `app_mentions:read` — receive `@twenty` mentions (assistant)
   - `channels:history` / `groups:history` / `im:history` — read thread
     context so assistant follow-ups work
   - `channels:read` — `conversations.list` / channel picker (public)
   - `chat:write` — post, update, delete, ephemeral
   - `chat:write.public` — post to public channels without the bot joining
   - `groups:read` — list private channels the bot is in
   - `im:read` / `im:write` — receive and answer DMs (assistant)
   - `reactions:write` — add reactions
   - `users:read` — resolve the requester's display name (assistant)

   Tip: instead of configuring scopes by hand, create the Slack app from
   [`slack-app-manifest.yaml`](./slack-app-manifest.yaml) (**Create New App**
   → **From an app manifest**) — it carries the scopes, bot user, event
   subscriptions, and redirect URL in one file.

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

## Assistant setup

The assistant listens to `@mentions` and DMs through Slack's Events API and
answers with the **Slack Assistant** agent shipped by this app. On top of the
base setup above:

1. **Signing secret** — copy the **Signing Secret** from your Slack app's
   **Basic Information** page into the `SLACK_SIGNING_SECRET` server variable
   (**Settings → Applications → Twenty Slack → Application registration**).
   Incoming events are HMAC-verified against it; without it the events route
   rejects everything.
2. **Assign a role to the agent** — in Twenty, assign the shipped
   **Slack Assistant agent role** (or a narrower role of your own) to the
   **Slack Assistant** agent. This is a deliberate manual step: installing the
   app grants the assistant **no** CRM access until an admin decides what it
   may read and write. Without a role the assistant answers that it cannot
   access data.
3. **Events API** — on the Slack app, enable **Event Subscriptions**, set the
   **Request URL** to `https://<your-twenty-public-domain>/slack/events`
   (Twenty resolves the workspace from the `Host` header; on deployments
   without a public functions domain use the legacy
   `<YOUR_TWENTY_SERVER_URL>/s/slack/events`), and subscribe to the bot
   events `app_mention` and `message.im`. Slack verifies the URL with a
   challenge that the route answers automatically once step 1 is done. For
   local development, expose your dev server with a tunnel (e.g.
   `ngrok http 3000`).
4. **Model provider** — the agent runs on your instance's configured AI
   models (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, ...). Cloud instances have
   this out of the box.

Then invite the bot to a channel and mention it, or DM it. The bot posts a
placeholder reply immediately and edits it with the answer when the agent
finishes.

### How it works

`/slack/events` (public route, signature-verified, answers Slack within its
3-second deadline) creates a **Slack Assistant Request** record; the record
creation triggers the `slack-assistant-worker` logic function, which posts the
placeholder, gathers thread context (`conversations.replies`), runs the agent
via `runAgent`, and edits the placeholder with the result. The records double
as an audit log of every assistant interaction (request, response, status,
error), and duplicate Slack deliveries are dropped by `event_id`.

### Security notes

- **The agent role is the permission boundary.** Anyone who can message the
  bot in Slack acts with the permissions of the role assigned to the agent —
  Slack users are not mapped to individual Twenty members yet. Scope the role
  accordingly.
- The assistant is instructed never to delete records, and the shipped role
  does not allow deletion.
- Thread context is passed to the agent as untrusted content; still, prefer
  inviting the bot only to channels where that is acceptable.
