# Slack

**Your CRM, in the conversation — ask Twenty anything from Slack and post back to any channel.**

## ✨ What you get

- **A CRM assistant in Slack** — `@twenty how many open opportunities do we have?` or `@twenty create a company called ACME`. It answers in-thread, remembers the thread, and can read, create, update and soft-delete records
- **Follow-ups without re-mentioning** — once it has replied in a thread you can keep talking to it for 24 hours; when that window lapses it privately nudges you to mention it again
- **Slack steps for your workflows** — post, update or delete messages, send ephemerals, add reactions, list channels

## 🤖 The assistant

Mention the bot in a channel or DM it. It replies in the thread with your CRM data, using the recent conversation as context. Answers end with native thumbs up / thumbs down feedback buttons — except very long answers, which fall back to plain text without them — and ratings are stored on the matching Slack Assistant Request record in Twenty.

Out of the box the bot runs with the **Slack Assistant** role, which can read, create, update and soft-delete people, companies, opportunities, notes and tasks. Workspace members stay read-only and hard delete is off. Tighten the role in **Settings → Roles** if you want a narrower bot.

**It acts as whoever tagged it.** The first time someone mentions the bot, their Slack profile email is matched against workspace members and the pair is stored as a **Slack User Link** record. The person who connects the Slack workspace is matched the same way right at connection time, and the rest of the Slack roster is swept for matching emails in the same pass, so most people are linked before anyone messages the bot. From then on the bot runs with that member's own permissions, so it can never do more than the person asking. Someone with no link gets the **Slack Assistant** role instead, exactly as before.

A link matched on email is re-verified on every request: the bot rechecks that the Slack account's current verified email still points at the same member, and follows the live match rather than the stored record if they disagree. The record is an audit trail, not the source of truth.

Only members of the Slack workspace that installed the app are matched automatically. Guests and Slack Connect users from another Slack workspace are not, because their email is vouched for by someone other than your admin. For those cases a member with the roles permission can link them by hand from the **Slack user links** section of the app's **Settings** tab, or by asking the assistant to link a Slack user to a workspace member; either way the pair is stored with its source set to manual. The Settings section searches members by name so there is no need to paste a member ID, searches the Slack workspace by name or email the same way to pick the Slack account, and spells out next to the save button whether saving activates the link immediately or sends an approval request, so you never link or message the wrong account. It lists the existing links with their status, lets a member with the permission remove a link or resend a pending consent request, and shows a read-only view to anyone without the permission. A guest or Slack Connect user whose email is not in your workspace is linked by their Slack user ID instead; for a Slack Connect user, include their own Slack workspace's team ID so the link matches the messages they send.

The same section lists Slack users who have no link yet, so an admin can see who the automatic match skipped and finish the job in place: each row has its own member picker, spells out whether linking activates immediately or asks the person first, and saves without leaving the list. A **Match by email** button reruns the roster sweep on demand, which covers workspaces that connected the app before the sweep existed and new hires who joined Slack after connection. The sweep only trusts a confirmed email on a full member of the installed workspace and never touches an existing link, so a declined or hand-made link is left alone.

**A matching email needs no approval.** Linking a Slack account to the workspace member with the same email is just the automatic match set up ahead of the person's first message, so it is stored as an email-matched link and is active immediately, with the same live re-verification automatic links get.

**Any other manual link asks the person first.** When you link someone who is in the installed Slack workspace to a member with a different email, the app sends them a direct message explaining that an admin wants the assistant to act with a workspace member's access, with **Approve** and **Decline** buttons. The link stays inactive (shown as _Awaiting consent_) until they approve, so the assistant never borrows someone's permissions without their say-so; a decline keeps it off. Guests and Slack Connect users from another workspace cannot be messaged this way, so their link is admin-set and active on save, labelled as such. A consented or admin-set manual link wins over email matching. Slack User Link records can only be written by the app itself, never directly through the API or the UI, so a manual link always reflects both an admin's decision and, where possible, the person's consent. Sending the consent request needs the `im:write` scope, so reconnect the Slack app after upgrading to grant it.

One Slack workspace answers into one Twenty workspace.

When the bot is added to a channel it introduces itself once, with a short message in the channel and the details (what to ask it, what it reads, and how permissions work) in a thread reply. It needs the `member_joined_channel` subscription, so leave that one off if you want the bot to arrive quietly.

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

**Free** — the app itself costs no credits and is not metered.

The assistant still runs on your workspace AI credits, billed on the model's token usage, so every mention or DM answered has an indirect cost. The workflow steps only call Slack and consume nothing.

## 📌 Heads up

You need to create a Slack app and connect it — see [SETUP.md](./SETUP.md). The assistant needs a few extra steps (signing secret and event subscriptions) on top of the base connection.
