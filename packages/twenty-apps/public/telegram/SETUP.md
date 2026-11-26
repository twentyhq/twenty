# Telegram setup

One Telegram bot serves every workspace of a Twenty server. A server admin
creates it once.

## Requirements

- Twenty must be reachable from the internet over HTTPS on port 443, 80, 88 or
  8443, with a valid certificate. Telegram delivers updates to
  `/webhooks/server/...` and does not support IPv6-only hosts.
- The app must be installed in the workspace that owns its registration.
  Updates are routed through that workspace, so the route returns 404 until it
  is installed there.

## 1. Create the bot

1. In Telegram, open a chat with [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts. The username is public and cannot be
   changed later.
3. Copy the token BotFather returns. Anyone holding it controls the bot.

Leave **Group Privacy** enabled. The bot only handles direct messages.

## 2. Set the server variables

Set these on the app registration:

| Variable | Value |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | The token from BotFather. |
| `TELEGRAM_WEBHOOK_SECRET` | A random string of 1 to 256 characters among `A-Z`, `a-z`, `0-9`, `_` and `-`. |

Generate a secret with:

```bash
openssl rand -hex 32
```

## 3. Register the webhook

Nothing to do by hand. The app registers the webhook with Telegram, with the
secret, each time a member starts connecting their account. After rotating
`TELEGRAM_WEBHOOK_SECRET`, start one connection to put the new secret in use.

## Record links in answers

The bot links records to the workspace URL. Telegram drops links to
`localhost`, so on a local stack record names arrive as plain text. Links work
once the workspace is served from a public URL.

## Who can connect

Only admins can open the app's settings screen. Every other member connects
their account with **Connect Telegram** in the command menu.

## How messages are routed

Telegram has no notion of a workspace, so routing is per Telegram account:

- Starting a connection in Twenty creates a one-time token claimed by that
  workspace. The link `https://t.me/<bot>?start=<token>` carries it to the bot.
- When the account presses **Start**, the workspace claims the Telegram user id
  and saves a Telegram User Link to the member.
- Every later direct message from that account goes to that workspace.

A Telegram account can be claimed by one workspace at a time on a server.

## Troubleshooting

- **A banner on the app page.** The app's health check says what is wrong
  with the bot: the variables are missing, Telegram rejected
  the token, the webhook is missing or points to another server, or Telegram
  failed to deliver messages in the last hour.
- **The bot does not answer.** Check both server variables are set, then ask
  Telegram what it sees:

  ```bash
  curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
  ```

  `last_error_message` reports delivery failures. A 401 means the secret
  Telegram holds differs from `TELEGRAM_WEBHOOK_SECRET`: start a connection
  from Twenty to register it again.
- **"This connection link has expired".** Links work once and last 10 minutes.
  Start a new connection from Twenty.
