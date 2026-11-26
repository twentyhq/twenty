# Telegram

**Connect Telegram accounts to your Twenty workspace members.**

> This first version only connects accounts. Asking Twenty questions from
> Telegram builds on it and is not available yet.

## How it works

One Telegram bot serves the whole Twenty server. A member connects their own
Telegram account from Twenty, and the bot then knows which workspace and which
member a direct message comes from.

1. In Twenty, the member opens the Telegram app settings, or runs **Connect
   Telegram** from the command menu, and gets a one-time link.
2. The link opens the bot in Telegram. Pressing **Start** completes the
   connection. On a computer without the Telegram app, scan the QR code shown
   under the link with your phone, or send the `/start` command shown there to
   the bot.
3. Sending `/disconnect` to the bot, blocking the bot, or disconnecting from the
   app settings removes it. Members with the roles permission can disconnect
   any account there.

A connection link works once and expires after 10 minutes.

## Heads up

- **Direct messages only.** The bot ignores groups and channels.
- **One workspace per Telegram account.** An account connected to one
  workspace has to send `/disconnect` before it can be connected to another
  workspace on the same server.
- **Nothing is stored for strangers.** People who message the bot without a
  connected account get a fixed reply, and their message is not saved.

## Getting started

Your server admin creates the bot and sets its credentials first: see the
[setup guide](https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/public/telegram/SETUP.md).

## Billing

**Free.**
