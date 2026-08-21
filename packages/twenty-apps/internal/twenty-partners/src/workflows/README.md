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

Nudges validated partners once a day when new briefs appear. The mail is a nudge, not a
catalogue: partners already see every open brief in the **Open Briefs** view, so the mail
says how many briefs are new and points at the partner workspace. No brief details, no
per-partner matching.

**Cron role.** A cron workflow runs under the application role, not a user's, so it can
read every partner.

### Build (Settings → Workflows)

1. **+ New workflow** → name **Daily Digest**.
2. Open the trigger (**Cron trigger**). Set the pattern to **DAYS**, once a day.
3. Add a **Find Records** step on **Opportunity**: `isListed` is true and created in the
   last day.
4. Add a **Stop** step that stops the run when the count from step 3 is zero. Send nothing
   on an empty day.
5. Add a **Find Records** step on **Partner**: `validationStage` is `VALIDATED`.
6. Add an **Iterator** step over the partners from step 5, then a **Send Email** action
   inside it, sent from a mailbox connected to the workspace.
7. **Publish** the workflow version.

---

## Per-workspace checklist

| Step | Mark as Winner | Daily Digest |
| --- | --- | --- |
| Trigger | Manual, single **Application** | Cron, daily |
| Action | Update linked **Opportunity** | Send Email per partner |
| Published label | **Mark as Winner** (on application) | **Daily Digest** |
| Who runs it | Admin / Partner Ops | Application role |

Repeat for each workspace after install. Workflows are workspace metadata — they do not
travel with `deploy` / `install`.
