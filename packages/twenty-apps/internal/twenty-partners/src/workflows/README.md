# Manual workflows runbook

The Twenty Partners app relies on three workflows built in the Twenty workspace UI: two
**manual-trigger workflows** and one **cron workflow**. The SDK has no `defineWorkflow`, so
these are documented setup steps — not shipped in the app manifest.

**Rebuild all three workflows in every workspace** where the app is installed (local
bundles, staging, prod). After `yarn twenty install`, prod is empty until an admin follows
this runbook.

## Prerequisites

- Twenty Partners app installed and synced (`yarn twenty apply`).
- **Partner role** already grants the **WORKFLOWS** permission flag (shipped in the app).
  Partners need this to see **Run workflow → Apply** on a brief. Admins run **Mark as
  Winner** with their own role (no special flag beyond workflow access).

---

## 1. Apply to Brief

Partner self-apply on an **Opportunity** (brief). Creates an **Application** and lets
`on-application-created` resolve the Partner from the clicking member.

### Build (Settings → Workflows)

1. Open **Workflows** (sidebar or Settings) and click **+ New workflow**.
2. Name it **Apply to Brief** (the published label can be shortened to **Apply**).
3. Open the trigger node (**Manual trigger**). Set **Availability** to **Single record** and
   the object to **Opportunity**.
4. Add a **Form** step with one TEXT input named `pitch`. Set its label to tell the partner
   that Twenty introduces up to 2 partners per brief, so an application is not a guarantee.
5. Add a **Filter** step that requires `pitch` to be non-empty. The form schema has no
   required flag, so this filter is the only guard against an empty pitch.
6. Add an action: **Create Record**. Set **Object** to **Application** and map:
   - **Opportunity** → `{{trigger.record.id}}`
   - **Partner User** → `{{trigger.workspaceMember}}` *(mandatory — see note below)*
   - **pitch** → the Form step's `pitch` value
7. **Publish** (activate) the workflow version.

**Manual-trigger role.** A manual-trigger workflow runs under the clicking user's role, so
this one runs with the Partner role and its permissions.

**Partner User is mandatory.** The Partner role's row-level security on Application is
`partnerUser IS the current member`, and the server validates it against the row as
submitted. A **Create Record** without **Partner User** fails with *"Record does not
satisfy row-level security constraints of your current role"*. `on-application-created`
runs after the insert, so it cannot rescue it. Partner User is writable only because it is
the RLS predicate field — the server exempts those from the role's field locks.

**Only Opportunity, Partner User and pitch are mappable.** Every other Application field is
locked for the Partner role, so adding one (e.g. **State** → `APPLIED`) fails the insert
with *"no permission to write field …"*. `state` defaults to `APPLIED` on its own.

**Order of operations.** On a workspace that already runs the app:

1. Publish this workflow version first — the strict predicate rejects every apply until the
   Partner User mapping is live. If the workflow already exists, edit it instead: add
   **Partner User**, remove every other mapping, republish.
2. `yarn rls:configure` (`:prod`) — narrows the Application predicate to `partnerUser IS me`.

Rows created before the narrowing carry no `partnerUser`, so the predicate hides them from
their own partner. The app's post-install logic function stamps them during `app:install`,
before step 2 runs. No manual step.

### Expected UI (partner)

On an **Opportunity** record (e.g. from **Open Briefs**), command menu → **Run workflow
→ Apply**.

---

## 2. Mark as Winner

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

## 3. Daily digest

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

| Step | Apply to Brief | Mark as Winner | Daily Digest |
| --- | --- | --- | --- |
| Trigger | Manual, single **Opportunity** | Manual, single **Application** | Cron, daily |
| Action | Create **Application** | Update linked **Opportunity** | Send Email per partner |
| Published label | **Apply** (on brief) | **Mark as Winner** (on application) | **Daily Digest** |
| Who runs it | Partner (WORKFLOWS flag) | Admin / Partner Ops | Application role |

Repeat for each workspace after install. Workflows are workspace metadata — they do not
travel with `deploy` / `install`.
