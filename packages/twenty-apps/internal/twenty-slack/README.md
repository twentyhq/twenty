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

## Slack app setup

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps)
   (dedicated to this Twenty app — do not reuse for other Twenty apps).
2. **OAuth & Permissions** → **Bot Token Scopes** (minimum for these tools):
   - `chat:write`
   - `chat:write.public` (optional, if posting to channels the bot is not in)
   - `reactions:write`
3. Install the app to the workspace and copy the **Bot User OAuth Token**
   (`xoxb-...`).
4. Invite the bot to channels where it should post, if required by your
   workspace rules.

## Twenty setup

1. Register / install this app on your Twenty server (`twenty-slack`).
2. Set the **`SLACK_BOT_TOKEN`** server variable on the app registration to
   the bot token from Slack. The value is injected into every logic function
   execution.

## Development

```bash
cd packages/twenty-apps/internal/twenty-slack
yarn install
yarn lint
yarn test
```

Use `yarn twenty dev` from this directory to develop against a local Twenty
instance (see other internal apps in this monorepo).
