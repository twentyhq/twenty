# Manual workflows runbook

The Twenty Partners app relies on **admin-only manual-trigger workflows** built in the Twenty
workspace UI. The SDK has no `defineWorkflow`, so these are documented setup steps — not shipped
in the app manifest. **Rebuild them in every workspace** where the app is installed (local
bundles, staging, prod). After `yarn twenty install`, prod is empty until an admin follows this
runbook.

> **Partners do not use workflows.** A partner applies by **creating an Application directly**
> from a listed brief (a normal record write — `on-application-created` then resolves the Partner
> from `createdBy`, sets `state = APPLIED`, stamps `partner`/`partnerUser`/`lastActivityAt`, and
> dedupes). There is no "Apply" workflow and the Partner role carries **no `WORKFLOWS` flag**.
> Manual workflows are therefore **admin-only**: admins bypass the `WORKFLOWS` permission flag via
> `canUpdateAllSettings`; partners can't run them (the run is rejected server-side even if the
> action is visible on a brief).

## Prerequisites

- Twenty Partners app installed and synced (`yarn twenty dev --once` or `install`).
- RLS predicates applied: `yarn rls:configure` (partner scoping; not workflow-specific but part
  of install).
- **For outreach (the Send workflow):** a **connected mailbox** in the workspace
  (Settings → Accounts). `Send Email` sends *through* it — with none connected there is no
  sender, so outreach comes from a real, repliable address.

---

## 1. Mark as Winner (admin)

Admin assigns the winning partner on the linked **Opportunity**. Fires
`on-opportunity-partner-won`, which cascades Application states to **WON** / **BACKUP**.

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

*(Equivalent shortcut: an admin can just set the `Partner` field on the Opportunity directly —
same cascade.)*

### Expected UI (admin)

On an **Application** record, command menu → **Run workflow → Mark as Winner**.

---

## 2. Send — outreach (per brief) (admin)

One admin click on a brief sends the whole curated outreach round: a digest to the client, the
brief to each invited partner, and a 1:1 intro per partner — then advances those applications to
`INTRODUCED`.

### Curate first

1. Invite partners as Applications in **`INVITED`** ("queued for this round").
2. Demote anyone who shouldn't be contacted to **`BACKUP`** — Send only targets `state = INVITED`,
   so bumped partners drop out automatically.

### Build (Settings → Workflows)

1. **+ New workflow** → name **Send** (e.g. "Send to client + partners").
2. Open the trigger (**Manual trigger**). **Availability** → **Single record**, object
   **Opportunity** (the brief).
3. **Find Records** — Applications where the `opportunity` relation is the trigger brief **AND**
   `state = INVITED`. (Resolve each Application's `partner.email`.)
4. **Code** — build the client-digest body (a list of the invited partners). Resolve the client
   email from `{{trigger.record.pointOfContact}}` → `primaryEmail`. **Stop** if the invited set
   is empty.
5. **Send Email** — **A (client digest):** to the client contact, body = the digest of all invited
   partners.
6. **Iterator** over the found Applications:
   - **Send Email** — **B (the brief):** to `partner.email`.
   - **Send Email** — **C (intro):** to the client **+** `partner.email`, the 1:1 introduction.
   - **Update Record** — set the Application `state = INTRODUCED`, `introSentAt = now`.
7. **Update Record** — set the brief's `partnersPresentedAt = now`.
8. **Publish** the workflow version.

### Idempotency

Send acts only on `INVITED`; sent applications become `INTRODUCED`, so a re-click sends nothing.
Newly-invited partners are picked up by the next Send. `introSentAt` (Application) and
`partnersPresentedAt` (Opportunity) are the audit stamps.

### Client email — never on the Opportunity

The client email is **not** a field on the Opportunity (partners can read listed briefs).
Always resolve it via `pointOfContact → primaryEmail` (that Person is not partner-readable).
Briefs must have a `pointOfContact` with an email at creation/import.

### Expected UI (admin)

On an **Opportunity** record (a brief), command menu → **Run workflow → Send**.

---

## Retired / removed

- **"Apply to Brief"** — removed. Partners self-apply by creating an Application directly (see the
  note at the top); there is no Apply workflow and no `WORKFLOWS` flag on the Partner role.
- **Legacy "Send email"** (event trigger on `application.updated`, looked up a Person by
  `partnerUserId`) — **superseded by the Send workflow above; delete it** in each workspace. It
  was non-functional (wrong recipient lookup + no connected account).

## Per-workspace checklist

| Step | Mark as Winner | Send (outreach) |
| --- | --- | --- |
| Trigger | Manual, single **Application** | Manual, single **Opportunity** |
| Action | Update linked **Opportunity** (`partner`) | Find invited apps → digest → iterate emails → advance state |
| Prereq | — | **connected mailbox** + briefs have `pointOfContact` email |
| Who runs it | Admin / Partner Ops | Admin / Partner Ops |

Also: **delete the legacy "Send email" workflow.** Workflows are workspace metadata — they do not
travel with `deploy` / `install`, so repeat for each workspace after install.
