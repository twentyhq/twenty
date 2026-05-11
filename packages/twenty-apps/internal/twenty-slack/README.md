# twenty-slack

Slack tools for **Twenty workflows** (and agents): post messages, ephemeral
messages, update/delete bot messages, and add reactions. Uses the official
[`@slack/web-api`](https://github.com/slackapi/node-slack-sdk) `WebClient`
(Slack retries and error types).

## Tools

| Name | Slack API |
|------|-----------|
| `slack_post_message` | `chat.postMessage` |
| `slack_post_ephemeral_message` | `chat.postEphemeral` |
| `slack_update_message` | `chat.update` |
| `slack_delete_message` | `chat.delete` |
| `slack_add_reaction` | `reactions.add` |

### Workflow field names (for authors)

Fields use camelCase names in the step UI, for example **`slackChannelId`** (Slack’s channel / DM ID), **`messageText`**, and **`messageTimestamp`** (Slack’s per-message id — same value as tool output **`slackTs`** when chaining steps). Optional **`parentMessageTimestamp`** is only for **thread replies**. **`useSlackMarkdown`** turns on Slack’s `*bold*`-style formatting. Ephemeral steps use **`recipientSlackUserId`**; reactions use **`emojiName`** (Slack shortcode, for example `white_check_mark`). Updating a message uses **`newMessageText`**.

## Slack app setup

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps)
   (dedicated to this Twenty app — do not reuse for other Twenty apps).
2. **OAuth & Permissions** → **Bot Token Scopes** (minimum for these tools):
   - `chat:write`
   - `chat:write.public` (optional, if posting to channels the bot is not in)
   - `reactions:write`
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
