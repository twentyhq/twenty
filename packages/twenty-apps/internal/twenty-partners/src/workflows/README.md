# Manual workflows runbook

The Twenty Partners app relies on two workflows built in the Twenty workspace UI: one
**manual-trigger workflow** and one **cron workflow**. The SDK has no `defineWorkflow`, so
these are documented setup steps — not shipped in the app manifest.

**Rebuild both workflows in every workspace** where the app is installed (local
bundles, staging, prod). After `yarn twenty install`, prod is empty until an admin follows
this runbook.

## Prerequisites

- Twenty Partners app installed and synced (`yarn twenty apply`).
- The **WORKFLOWS** permission flag is no longer needed for apply: the apply path now
  ships in the app manifest as a command menu item. Admins run **Mark as Winner** with
  their own role (no special flag beyond workflow access).

---

## 1. Mark as Winner

Admin assigns the winning partner on the linked **Opportunity**. Fires
`on-opportunity-partner-won`, which cascades Application states to **WON** / **DECLINED**.

### Build (Settings → Workflows)

1. **+ New workflow** → name **Mark as Winner**.
2. Open the trigger (**Manual trigger**).
3. Set **Availability** to **Single record**.
4. Choose object **Application**.
5. Add an action: **Update Record**.
6. Configure the action:
   - **Object** → **Opportunity**
   - **Record ID** → `{{trigger.record.opportunity.id}}`
   - **Fields to update** → select **Partner**
   - **Partner** value → `{{trigger.record.partner.id}}`
7. **Publish** the workflow version.

### Expected UI (admin)

On an **Application** record, command menu → **Run workflow → Mark as Winner**.

---

## 2. Daily digest

Nudges validated partners once a day when new briefs appear: count + link, no brief
details. Zero new briefs → no email. Hand-built per workspace — workflows are workspace
metadata and do not travel with the app.

Validated structure (local, 2026-08-25):

1. Trigger — **Cron, daily 07:00**. (A test build may use a manual trigger; switch to
   cron before relying on it.)
2. **Find Records** `Search new opp` — Opportunity, `Creation date` is relative
   `PAST_1_DAY` and `isListed` is true. Raise the record limit well above the editor
   default of 1.
3. **Find Records** `Search Partners` — Partner, `Validation Stage` is `VALIDATED`.
   Raise the record limit as well.
4. **Iterator** over the partners from step 3. Inside the loop:
   - **Find Records** `Search people partner` — Person whose `Partner → Id` is
     `{{currentItem.id}}`. The workflow engine loads no relations, so this extra search
     is what resolves the partner's contact email.
   - **If/Else** — continue only when the person search returned an email.
   - **Send Email** — from the workspace's connected mailbox, to the found person email.
     Subject and body carry the count from step 2 and the prod marketplace link.
5. Publish and confirm the version shows ACTIVE.

Prod prerequisites: a connected mailbox (Settings → Accounts) and app ≥ 1.8.0 applied.

### Local email testing (never prod)

Run smtp4dev:
`docker run --rm -d --name smtp4dev -p 8090:80 -p 2525:25 -p 1143:143 rnwood/smtp4dev`.
Set `OUTBOUND_HTTP_SAFE_MODE_ENABLED` to false (Settings → Admin Panel → Config
Variables) — safe mode blocks private hosts for IMAP/SMTP on purpose. Connect an
IMAP/SMTP account with host `host.docker.internal` (SMTP 2525, IMAP 1143, no TLS, any
credentials). Mails land at http://localhost:8090. `EMAIL_DRIVER` env vars are the
system mailer, not this — leave them alone.

---

## Per-workspace checklist

| Step | Mark as Winner | Daily Digest |
| --- | --- | --- |
| Trigger | Manual, single **Application** | Cron, daily |
| Action | Update linked **Opportunity** | Send Email per partner via person lookup |
| Published label | **Mark as Winner** (on application) | **Daily Digest** |
| Who runs it | Admin / Partner Ops | Application role |

Repeat for each workspace after install. Workflows are workspace metadata — they do not
travel with `deploy` / `install`.
