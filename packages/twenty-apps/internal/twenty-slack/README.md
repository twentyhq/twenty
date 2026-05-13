# twenty-slack

Slack tools for **Twenty workflows** (and agents): post messages, ephemeral
messages, update/delete bot messages, and add reactions. Uses the official
[`@slack/web-api`](https://github.com/slackapi/node-slack-sdk) `WebClient`
(Slack retries and error types).

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

## Slack app setup

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps)
   (dedicated to this Twenty app — do not reuse for other Twenty apps).
2. **OAuth & Permissions** → **Bot Token Scopes** (minimum for these tools).
   Twenty uses Slack’s **bot** OAuth (`oauth/v2/authorize` with `scope=…`). You
   must add scopes here — not only under **User Token Scopes** — or Slack will
   refuse install with *“doesn’t have a bot user to install”* until at least one
   bot scope exists:
   - `chat:write`
   - `chat:write.public` (optional, if posting to channels the bot is not in)
   - `reactions:write`
   - `channels:read` (for `slack-list-channels` on public channels)
   - `groups:read` (for `slack-list-channels` on private channels)
3. Set the **Redirect URL** to `<SERVER_URL>/apps/oauth/callback` (local dev:
   `http://localhost:3000/apps/oauth/callback`).
4. Copy the Slack **Client ID** and **Client Secret**.

## Twenty setup

1. Register / install this app on your Twenty server (`twenty-slack`).
2. In **Settings → Applications → Twenty Slack**, open the **Application registration**
   tab (admin-only) and set:
   - `SLACK_CLIENT_ID`
   - `SLACK_CLIENT_SECRET`
3. In the same app, open the **Connections** tab and click **Add connection**.
   Choose **Just for me** or **Workspace shared**, then complete the Slack sign-in.

Once connected, workflow steps use the connection access token (workspace-shared
credentials win when present; otherwise the first user connection is used).

## Development

```bash
cd packages/twenty-apps/internal/twenty-slack
yarn install
yarn lint
yarn test
```

Use `yarn twenty dev` from this directory to develop against a local Twenty
instance (see other internal apps in this monorepo).
