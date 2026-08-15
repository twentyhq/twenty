# Slack

**Your CRM, in the conversation — ask Twenty anything from Slack and post back to any channel.**

## ✨ What you get

- **A CRM assistant in Slack** — `@twenty how many open opportunities do we have?` or `@twenty create a company called ACME`. It answers in-thread, remembers the thread, and can read, create, update and soft-delete records
- **Follow-ups without re-mentioning** — once it has replied in a thread you can keep talking to it for 24 hours; when that window lapses it privately nudges you to mention it again
- **Record link previews** — paste a Twenty record link in Slack and it expands into a compact card with the record's name and key fields (an opportunity shows stage, amount and close date)
- **Slack steps for your workflows** — post, update or delete messages, send ephemerals, add reactions, list channels

## 🤖 The assistant

Mention the bot in a channel or DM it. It replies in the thread with your CRM data, using the recent conversation as context.

The bot runs with the **Slack Assistant** role, which by default can read, create, update and soft-delete people, companies, opportunities, notes and tasks. Workspace members stay read-only and hard delete is off. Tighten the role in **Settings → Roles** if you want a narrower bot.

**It acts as whoever tagged it.** The first time someone mentions the bot, their Slack profile email is matched against workspace members and the pair is stored as a **Slack User Link** record. From then on the bot runs with that member's permissions *and* the Slack Assistant role: it can never do more than the person asking, and never more than the role allows. Someone with no link gets the Slack Assistant role on its own, exactly as before.

A link matched on email is re-verified on every request: the bot rechecks that the Slack account's current verified email still points at the same member, and follows the live match rather than the stored record if they disagree. The record is an audit trail, not the source of truth.

Only members of the Slack workspace that installed the app are matched automatically. Guests and Slack Connect users from another Slack workspace are not, because their email is vouched for by someone other than your admin. A link can be created by hand from **Slack User Links** with its source set to manual, but the bot does not act on manual links yet: any role with broad record access could write one, so until Twenty can restrict who creates them they are stored without borrowing anyone's permissions, and those users get the Slack Assistant role.

One Slack workspace answers into one Twenty workspace.

When the bot is added to a channel it introduces itself once, with a short message in the channel and the details (what to ask it, what it reads, and how permissions work) in a thread reply. It needs the `member_joined_channel` subscription, so leave that one off if you want the bot to arrive quietly.

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

**Free** — the app itself costs no credits and is not metered.

The assistant still runs on your workspace AI credits, billed on the model's token usage, so every mention or DM answered has an indirect cost. The workflow steps only call Slack and consume nothing.

## 📌 Heads up

You need to create a Slack app and connect it — see [SETUP.md](./SETUP.md). The assistant needs a few extra steps (signing secret and event subscriptions) on top of the base connection.
