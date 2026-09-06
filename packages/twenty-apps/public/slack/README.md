# Slack

**Your CRM, in the conversation. Ask Twenty anything from Slack, and post back to any channel.**

## ✨ What you get

- **A CRM assistant in Slack**: `@twenty how many open opportunities do we have?` It answers in the thread and can read, create, update and soft-delete records
- **It acts as whoever tagged it**: Slack accounts are matched to workspace members, so nobody gets more access through Slack than they already have in Twenty
- **Follow-ups without re-mentioning**: once it has replied, keep talking in the thread for 24 hours in a channel, indefinitely in a DM
- **Record link previews**: paste a link to a person, company, opportunity, note or task and Slack shows a card with the record's key fields
- **Slack steps for your workflows**: post, update or delete messages, send ephemerals, add reactions, list channels

## 💳 Billing

No per-seat or per-message charge. The app's runs are metered like any other app's, at **$0.0001 per logic function invocation** plus runtime, and answers use AI credits on the model's token usage.

Every Slack event the bot subscribes to costs an invocation, including messages it never answers. Drop the `message.channels` and `message.groups` subscriptions to limit it to explicit mentions and DMs.

## 📌 Heads up

- **You create the Slack app**: Twenty connects to a Slack app you own, so an admin has to create it and set its credentials before anyone can connect. See [SETUP.md](https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/public/slack/SETUP.md).
- **One Slack workspace per Twenty workspace**: connecting claims that Slack team until the last connection using it is removed.
- **Private channels need an invite**: public channels are covered automatically.
