# Slack

**Your CRM, in the conversation — ask Twenty anything from Slack and post back to any channel.**

## ✨ What you get

- **A CRM assistant in Slack** — `@twenty how many open opportunities do we have?` or `@twenty create a company called ACME`. It answers in-thread and can read, create, update and soft-delete records
- **Follow-ups without re-mentioning** — once it has replied in a thread you can keep talking to it, for 24 hours in a channel and indefinitely in a DM
- **It acts as whoever tagged it** — Slack accounts are matched to workspace members, so the bot can never do more than the person asking
- **Slack steps for your workflows** — post, update or delete messages, send ephemerals, add reactions, list channels
- **Record link previews** — paste a link to a person, company, opportunity, note or task and Slack shows a card with the record's key fields, rendered only when the poster maps to a workspace member; expanding a card shows the full details, again only to viewers who map to a workspace member

## 🤖 The assistant

Mention the bot in a channel or DM it. It replies in the thread with your CRM data, using the recent conversation as context. Short answers end with native thumbs up / thumbs down buttons, and the rating is stored on the matching Slack Assistant Request record in Twenty.

A Slack account with no link to a workspace member runs with the **Slack Assistant** role, which can read, create, update and soft-delete people, companies, opportunities, notes and tasks. Workspace members stay read-only and hard delete is off. Tighten the role in **Settings → Roles** if you want a narrower bot.

Everyone else runs with their own permissions. Connecting the Slack workspace sweeps the roster and links every full member whose confirmed Slack email matches a workspace member; anyone the sweep missed is matched the first time they mention the bot. Each pair is stored as a **Slack User Link**. Guests and Slack Connect users are never matched automatically, so an admin links them by hand from the app's **Settings** tab, which also lists who the sweep skipped. Links made against a Slack workspace you have since disconnected stay in that list as history, marked **Slack workspace disconnected** rather than active, so they cannot be read as live access. See [SETUP.md](https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/public/slack/SETUP.md) for how linking, consent and re-verification work.

When the bot is added to a channel it introduces itself once, with a short message in the channel and the details in a thread reply.

## 🧰 The workflow steps

| Step                           | Slack API            |
| ------------------------------ | -------------------- |
| `slack-post-message`           | `chat.postMessage`   |
| `slack-post-ephemeral-message` | `chat.postEphemeral` |
| `slack-update-message`         | `chat.update`        |
| `slack-delete-message`         | `chat.delete`        |
| `slack-add-reaction`           | `reactions.add`      |
| `slack-list-channels`          | `conversations.list` |

Pick a **workspace shared** or **just for me** Slack connection; steps run with that token.

## 💳 Billing

No per-seat or per-message charge, but the app's runs are metered like any other app's — **$0.0001 per logic function invocation**, plus runtime.

Every Slack event the bot is subscribed to costs an invocation, including messages it never answers: `message.channels` and `message.groups` deliver every message posted in the channels the bot belongs to, which is what makes un-mentioned thread follow-ups work. Drop those two subscriptions to limit the bot to explicit mentions and DMs. Each workflow step run costs an invocation too.

Answering costs AI credits on top, billed on the model's token usage — the whole prompt as well as the reply — so cost tracks the conversation context, the records the bot reads and the length of its answer.

## 📌 Heads up

- **You create the Slack app** — Twenty connects to a Slack app you own, so an admin has to create it and set its credentials before anyone can connect. The assistant needs a signing secret and event subscriptions on top. See [SETUP.md](https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/public/slack/SETUP.md).
- **One Slack workspace per Twenty workspace** — connecting claims that Slack team. Removing the last connection using it releases the claim, so another Twenty workspace can then connect the same team. If a connection is broken — its Slack team is claimed elsewhere, or Slack no longer accepts its token — the Slack settings tab shows what is wrong and how to fix it.
- **Private channels need membership** — public channels are covered by `chat:write.public`; anywhere else, invite the bot.
