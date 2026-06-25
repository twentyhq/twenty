# Twenty for Twenty

The official Twenty internal app, with modules for Resend and more.

## Overview

**Twenty for Twenty** is the official internal Twenty app. It is organized into modules, each integrating a third-party service with Twenty.

### Resend module

Two-way sync between Twenty and the [Resend](https://resend.com) email platform. The module syncs contacts, segments, templates, broadcasts, and emails.

**Inbound (Resend → Twenty):**

- A cron job runs every 5 minutes to pull all entities from the Resend API.
- A webhook endpoint receives real-time events for contacts and emails.

**Outbound (Twenty → Resend):**

- Contact and segment changes in Twenty are pushed back to Resend when records are created, updated, or deleted.

## Configuration

In Twenty, go to **Settings → Applications → Twenty for Twenty** and set:

- **RESEND_API_KEY** — your Resend API key. Create one at https://resend.com/api-keys (full access recommended).
- **RESEND_WEBHOOK_SECRET** — the signing secret for verifying inbound webhooks (see "Webhook setup" below).

### Webhook setup

The app exposes an HTTP endpoint at `/s/webhook/resend` that receives Resend webhook events. To connect it:

1. Go to https://resend.com/webhooks
2. Click **Add webhook**
3. Set the **Endpoint URL** to your Twenty server's public URL + `/s/webhook/resend` (e.g. `https://your-domain.com/s/webhook/resend`)
4. Set **Event types** to **All Events**
5. Click **Add**
6. Copy the **signing secret** Resend displays and paste it into the `RESEND_WEBHOOK_SECRET` app variable in Twenty

## Sync behavior

### Inbound

| Source | Mechanism | Entities |
|---|---|---|
| Cron (every 5 min) | Polls Resend API, upserts into Twenty | Contacts, segments, templates, broadcasts, emails |
| Webhook (real-time) | Receives Resend events via HTTP | Contacts, emails |

### Outbound

| Twenty action | Resend |
|---|---|
| Create contact | Creates the contact in Resend |
| Update contact (name, email, unsubscribed) | Updates the Resend contact |
| Delete contact | Removes the Resend contact |
| Create segment | Creates the segment in Resend |
| Delete segment | Removes the Resend segment |
