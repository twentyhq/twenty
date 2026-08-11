# Slack

**Your CRM, in the conversation — ask Twenty anything from Slack and post back to any channel.**

## ✨ What you get

- **A CRM assistant in Slack** — `@twenty how many open opportunities do we have?` or `@twenty create a company called ACME`. It answers in-thread, remembers the thread, and can read, create, update and soft-delete records
- **Follow-ups without re-mentioning** — once it has replied in a thread you can keep talking to it for 24 hours; when that window lapses it privately nudges you to mention it again
- **Slack steps for your workflows** — post, update or delete messages, send ephemerals, add reactions, list channels

## 🤖 The assistant

Mention the bot in a channel or DM it. It replies in the thread with your CRM data, using the recent conversation as context.

Anyone who can message the bot acts with the **Slack Assistant** role, which by default can read, create, update and soft-delete people, companies, opportunities, notes and tasks. Workspace members stay read-only and hard delete is off. Tighten the role in **Settings → Roles** if you want a narrower bot.

One Slack workspace answers into one Twenty workspace.

When the bot is added to a channel it introduces itself once, with a short message in the channel and the details (what to ask it, what it reads, and the shared-role caveat above) in a thread reply. It needs the `member_joined_channel` subscription, so leave that one off if you want the bot to arrive quietly.

## 🧰 The workflow steps

| Step | Slack API |
|------|-----------|
| `slack-post-message` | `chat.postMessage` |
| `slack-post-ephemeral-message` | `chat.postEphemeral` |
| `slack-update-message` | `chat.update` |
| `slack-delete-message` | `chat.delete` |
| `slack-add-reaction` | `reactions.add` |
| `slack-list-channels` | `conversations.list` |

Pick a **workspace shared** or **just for me** Slack connection; steps run with that token.

## 💳 Billing

**Free** — no credits, no metering.

## 📌 Heads up

You need to create a Slack app and connect it — see [SETUP.md](./SETUP.md). The assistant needs a few extra steps (signing secret and event subscriptions) on top of the base connection.
