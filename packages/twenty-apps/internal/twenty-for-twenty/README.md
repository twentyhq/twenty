This is a [Twenty](https://twenty.com) application bootstrapped with [`create-twenty-app`](https://www.npmjs.com/package/create-twenty-app).

## Overview

**Twenty for Twenty** is the official internal Twenty app. It is organized into modules, each integrating a third-party service with Twenty.

### Resend module (`src/modules/resend/`)

Two-way sync between Twenty and the [Resend](https://resend.com) email platform. The module syncs contacts, segments, templates, broadcasts, and emails.

**Inbound (Resend -> Twenty):**

- A cron job runs every 5 minutes to pull all entities from the Resend API
- A webhook endpoint receives real-time events for contacts and emails

**Outbound (Twenty -> Resend):**

- Database event triggers push contact and segment changes back to Resend when records are created, updated, or deleted in Twenty

## Getting Started

### 1. Install and run the app

```bash
yarn twenty dev
```

This registers the app with your local Twenty instance at `http://localhost:3000/settings/applications`.

### 2. Configure app variables

In Twenty, go to **Settings > Applications > Twenty for Twenty** and set:

- **RESEND_API_KEY** -- Your Resend API key. Create one at https://resend.com/api-keys (full access recommended).
- **RESEND_WEBHOOK_SECRET** -- The signing secret for verifying inbound webhooks (see "Webhook setup" below).

### 3. Webhook setup

The app exposes an HTTP endpoint at `/s/webhook/resend` that receives Resend webhook events. To connect it:

1. Go to https://resend.com/webhooks
2. Click **Add webhook**
3. Set the **Endpoint URL** to your Twenty server's public URL + `/s/webhook/resend` (e.g. `https://your-domain.com/s/webhook/resend`)
4. Set **Events types** to **All Events**
5. Click **Add**
6. Copy the **signing secret** Resend displays and paste it into the `RESEND_WEBHOOK_SECRET` app variable in Twenty

The webhook handles:

- **Contact events** (`contact.created`, `contact.updated`, `contact.deleted`) -- upserts/deletes Resend contact records in Twenty
- **Email events** (`email.sent`, `email.delivered`, `email.bounced`, `email.opened`, `email.clicked`, etc.) -- updates delivery status on Resend email records in real-time
- **Domain events** -- logged and skipped (no domain object in the app yet)

### 4. Testing webhooks locally

Install the [Resend CLI](https://resend.com/docs/resend-cli):

```bash
brew install resend/cli/resend
```

Or via npm if Homebrew has issues:

```bash
npm install -g resend-cli
```

Authenticate:

```bash
resend login
```

Start the webhook listener with forwarding to your local Twenty server:

```bash
resend webhooks listen --forward-to http://localhost:3000/s/webhook/resend
```

The CLI will:

1. Create a public tunnel automatically
2. Register a temporary webhook in Resend pointing to that tunnel
3. Forward incoming events (with Svix signature headers) to your local Twenty server
4. Display events in the terminal as they arrive
5. Clean up the temporary webhook when you press Ctrl+C

To trigger test events, create or update a contact in the [Resend dashboard](https://resend.com/contacts), or send a test email.

## Sync behavior

### Inbound sync

| Source | Mechanism | Entities |
|---|---|---|
| Cron (every 5 min) | Polls Resend API, upserts into Twenty | Contacts, segments, templates, broadcasts, emails |
| Webhook (real-time) | Receives Resend events via HTTP | Contacts, emails |

### Outbound sync

| Twenty action | Resend API call |
|---|---|
| Create contact | `contacts.create()` -- writes `resendId` back to Twenty |
| Update contact (name, email, unsubscribed) | `contacts.update()` |
| Delete contact | `contacts.remove()` |
| Create segment | `segments.create()` -- writes `resendId` back to Twenty |
| Delete segment | `segments.remove()` |

### Loop prevention

A `lastSyncedFromResend` field on contact, segment, and email records tracks when data came from Resend. Outbound triggers skip processing when this field is part of the update, preventing infinite echo loops between inbound and outbound sync.

## Commands

Run `yarn twenty help` to list all available commands.

## Learn More

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
- [Resend API documentation](https://resend.com/docs)
- [Discord](https://discord.gg/cx5n4Jzs57)
