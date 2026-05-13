# Discord for Twenty

Connect Discord to your Twenty workflows. Post messages, edit them, react,
delete, and browse channels — all from the workflow builder or the AI chat.

## What you can do

Once installed and the admin has provided the bot token, five tools become
available in workflows and the AI chat:

- **Send Discord message** — *"post 'New deal closed 🎉' to #general"*. As a
  workflow step: provide `channelId` + `messageText`. Optional
  `replyToMessageId` turns it into a reply to a previous message.
- **Update Discord message** — edit a message the bot already sent. Useful
  for status messages that change as a workflow progresses.
- **Delete Discord message** — remove a bot message (for example after a
  mistake or when a workflow is cancelled).
- **Add Discord reaction** — react with a unicode emoji (`👍`, `✅`, `🎉`)
  or a custom server emoji (`partyparrot:643452342342342342`). Great for
  signalling status at a glance.
- **List Discord channels** — discovers the text-postable channels in a
  Discord server, useful as the first step in a workflow that picks a
  channel dynamically. **Leave `guildId` blank if your bot is in only one
  server — it auto-picks.** If the bot is in multiple servers, the error
  response lists each server's name and ID so you can copy the right one.

## Installing

1. Open **Settings → Applications** in your Twenty workspace.
2. Find **Discord** in the available apps and click **Install**.
3. Use any of the tools above in a workflow step or via the AI chat.

> **Heads up:** if you see *"Discord is not configured"* on the first run,
> your Twenty admin needs to follow the [Self-hosting setup](#self-hosting-setup-admin-only)
> section below — they need to create a Discord application and provide the
> bot token before the tools work.

## Finding channel and message IDs

Discord IDs are long numeric strings (e.g. `1234567890123456789`). To copy
them from the Discord client:

1. **Enable Developer Mode** once: **User Settings → Advanced → Developer
   Mode** (toggle on). Discord then shows extra "Copy ID" options on
   right-click.
2. **Channel ID** — right-click any channel → *Copy Channel ID*.
3. **Message ID** — right-click any message → *Copy Message ID*.
4. **Server (guild) ID** — right-click the server icon → *Copy Server ID*.
   Only needed for `discord-list-channels` when your bot is in multiple
   servers (otherwise leave it blank for auto-pick).

> **Tip:** when chaining steps, pass `messageId` from a previous *Send
> Discord message* step directly into a follow-up *Update / Delete / Add
> Reaction* step. No copy/paste needed.

## Limitations

What this connector intentionally does **not** support in v1:

- **Direct messages to users.** Discord's DM API needs a different identity
  flow.
- **Threads.** Replying inside a thread or starting a new one isn't exposed.
- **Webhooks.** Uses the bot REST API only.
- **Slash commands / interactions.** The bot doesn't register or respond to
  `/commands`.
- **Per-workspace identity.** All Twenty workspaces in the same Twenty
  deployment share the same Discord bot — see
  [Why bot token instead of OAuth?](#why-bot-token-instead-of-oauth) below.
- **2000-character message limit.** Discord rejects longer payloads with
  HTTP 400.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Discord is not configured` | `DISCORD_BOT_TOKEN` not set | Admin: paste the bot token in Settings → Applications → Discord → **Settings tab** |
| `401 Unauthorized` | Token wrong, copied with whitespace, or rotated | Reset the token in the Discord Developer Portal and re-paste |
| `Missing Access (50001)` | Bot wasn't invited to that server | Re-run the OAuth invite URL for that server (see admin setup) |
| `Missing Permissions (50013)` | Bot is in the server but lacks Send / Manage / React permissions | In Discord: server settings → roles → grant the bot's role the missing permission |
| `Unknown Channel (10003)` | `channelId` is wrong, or bot can't see that channel | Verify the ID; check the bot has *View Channel* permission |
| `Unknown Message (10008)` | `messageId` is wrong, or message was deleted | Verify the ID is from a still-existing message |
| `Cannot edit a message authored by another user (50005)` | Trying to update / delete a message the bot didn't send | The bot can only edit its own messages; it can delete others' messages only with the *Manage Messages* permission |
| `Bot is in N Discord servers — please specify which one` (from list-channels) | Bot is in multiple servers and `guildId` was left blank | Copy the server ID from the error message and paste it into the `guildId` field |
| `Discord API responded with 429` | Hit Discord's rate limit | Reduce workflow concurrency; this connector doesn't yet auto-retry |

---

## Self-hosting setup (admin-only)

This section is for Twenty server admins. If you're on Twenty Cloud, skip
this — the bot credentials are already configured.

### 1. Create a Discord application

1. Visit https://discord.com/developers/applications and click
   **New Application**.
2. Name it (e.g. *"Twenty Bot"*) and create. Use a dedicated app — don't
   reuse one configured for other bots.
3. Sidebar → **Bot** tab → **Reset Token** → copy the token immediately
   (it's only shown once; if you lose it, reset again).
4. *Recommended:* toggle **Public Bot** OFF so randoms can't invite the
   bot to their servers.

### 2. Generate the invite URL and add the bot to your server(s)

1. In the Discord Developer Portal: sidebar → **OAuth2** → **URL Generator**.
2. **Scopes**: tick `bot`.
3. **Bot Permissions**: tick `Send Messages`, `Manage Messages`,
   `Add Reactions`, `Read Message History`.
4. Copy the generated URL.
5. Open the URL in your browser, pick the Discord server, authorize.
   Repeat for each server you want workflows to post in.

### 3. Wire the bot token into Twenty

1. In Twenty: **Settings → Applications → Discord → Settings tab**
   (gear icon).
2. Paste the bot token into the `DISCORD_BOT_TOKEN` row. Saves on blur.

Workspace users can now use the Discord workflow tools immediately — no
further per-user configuration needed (which is unique vs Linear / Slack
where each user connects their own account).

---

## Why bot token instead of OAuth?

Slack and Linear use OAuth-per-workspace
(`defineConnectionProvider({ type: 'oauth' })`) so each Twenty workspace
stores its own access token. Discord works differently:

- Discord's `bot` scope **does** have an OAuth flow, but the `access_token`
  it returns is a *user* bearer token — useless for bot actions like posting
  messages. To actually send messages as the bot you need the static
  **bot token** from the Developer Portal.
- That bot token is global to the Discord application (and therefore to
  the Twenty deployment). Discord deprecated per-install bot tokens years
  ago.
- Webhooks are a separate auth model but only support posting — no edit,
  delete, or reactions — so they don't cover Slack/Linear parity.

The result: this connector skips `defineConnectionProvider` entirely and
reads `DISCORD_BOT_TOKEN` from an `applicationVariable` set once at
deployment scope. See
[Discord's OAuth2 docs](https://discord.com/developers/docs/topics/oauth2#bot-users)
for the underlying reason bot users authenticate via static tokens.

---

## Developers only

If you're working on this app rather than installing the published version:

```bash
cd packages/twenty-apps/internal/twenty-discord

# Day-to-day development (publish + install + watch in one):
yarn twenty dev

# Run unit tests:
yarn test

# Lint:
yarn lint
```

`twenty dev` is recommended for iteration — it publishes to your local
Twenty server, installs the app, and watches for changes in one command.

The Discord REST API (v10) is called directly via `fetch` — no `discord.js`
or other SDK dependency. See
`src/logic-functions/utils/discord-api-request.ts` for the auth and
error-handling wrapper that all handlers go through.
