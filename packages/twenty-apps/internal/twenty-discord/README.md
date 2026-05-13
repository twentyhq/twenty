# twenty-discord

Discord tools for **Twenty workflows** (and agents): post, update, and delete
bot messages and add reactions. Uses the Discord REST API v10 directly over
`fetch` — no bot framework dependency.

## Tools

| Name | Discord REST endpoint |
|------|------------------------|
| `discord-post-message` | `POST /channels/{channel.id}/messages` |
| `discord-update-message` | `PATCH /channels/{channel.id}/messages/{message.id}` |
| `discord-delete-message` | `DELETE /channels/{channel.id}/messages/{message.id}` |
| `discord-add-reaction` | `PUT /channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me` |

### Workflow field names (for authors)

Fields use camelCase in the step UI: **`channelId`** (Discord channel ID — long
numeric string), **`messageId`** (returned as `messageId` from a previous step,
or right-click → Copy Message ID), **`messageText`** / **`newMessageText`**,
**`replyToMessageId`** (post step, optional — set to a previous message ID for
a reply), and **`emoji`** (unicode emoji like `👍` or custom emoji `name:id`).

## Credential model

Discord doesn't fit the OAuth-per-workspace pattern of Slack or Linear — its
bot credentials are global to the application and stored once at deployment
scope. This connector therefore reads `DISCORD_BOT_TOKEN` from the app's
**Settings** tab (an `applicationVariable`, not an OAuth connection). The same
bot identity is used for every Twenty workspace in the deployment.

See [Discord's OAuth2 docs](https://discord.com/developers/docs/topics/oauth2#bot-users)
for why bot users authenticate via static tokens rather than OAuth bearer
tokens.

## Discord app setup

1. Create an application at [discord.com/developers/applications](https://discord.com/developers/applications)
   (dedicated to this Twenty app — do not reuse for other bots).
2. **Bot** tab → **Reset Token** → copy the bot token (only shown once).
3. Optional but recommended — disable **Public Bot** so randoms can't invite
   the bot to their servers.
4. Generate an invite URL: **OAuth2** → **URL Generator** →
   - Scopes: `bot`
   - Bot permissions: `Send Messages`, `Manage Messages`, `Add Reactions`,
     `Read Message History`
   - Copy the generated URL.
5. Click that URL once per Discord server you want workflows to post in — the
   bot joins the server with the requested permissions.

## Twenty setup

1. Register / install this app on your Twenty server (`twenty-discord`).
2. Go to **Settings → Applications → Twenty Discord → Settings tab** (gear
   icon) and paste the bot token into the `DISCORD_BOT_TOKEN` row. Saved on
   blur.
3. Use the workflow actions in any workflow. The bot must already be a member
   of the target Discord server (step 5 of the Discord setup) with the
   permissions required by each action.

## Development

```bash
cd packages/twenty-apps/internal/twenty-discord
yarn install
yarn lint
yarn test
```

Use `yarn twenty dev` from this directory to develop against a local Twenty
instance (see other internal apps in this monorepo).
