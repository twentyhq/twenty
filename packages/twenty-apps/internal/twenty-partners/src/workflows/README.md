# Manual workflows runbook

The Twenty Partners app relies on two **manual-trigger workflows** built in the Twenty
workspace UI. The SDK has no `defineWorkflow`, so these are documented setup steps — not
shipped in the app manifest.

**Rebuild both workflows in every workspace** where the app is installed (local bundles,
staging, prod). After `yarn twenty install`, prod is empty until an admin follows this
runbook.

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
3. Open the trigger node (**Manual trigger**).
4. Set **Availability** to **Single record**.
5. Choose object **Opportunity**.
6. Add an action: **Create Record**.
7. Set **Object** to **Application**.
8. Map exactly these two fields — **nothing else**:
   - **Opportunity** → `{{trigger.record.id}}`
   - **Partner User** → `{{trigger.workspaceMember}}` *(mandatory — see note below)*
9. **Publish** (activate) the workflow version.

**Partner User is mandatory.** The Partner role's row-level security on Application is
`partnerUser IS the current member`, and the server validates it against the row as
submitted. A **Create Record** without **Partner User** fails with *"Record does not
satisfy row-level security constraints of your current role"*. `on-application-created`
runs after the insert, so it cannot rescue it. Partner User is writable only because it is
the RLS predicate field — the server exempts those from the role's field locks.

**Map no other field.** Every remaining Application field is locked for the Partner role,
so adding one (e.g. **State** → `APPLIED`) fails the insert with *"no permission to write
field …"*. `state` defaults to `APPLIED` on its own.

**Order of operations.** Publish this workflow version *before* running
`yarn rls:configure` on the workspace — the strict predicate rejects every apply until the
Partner User mapping is live.

### Expected UI (partner)

On an **Opportunity** record (e.g. from **Open Briefs**), command menu → **Run workflow
→ Apply**.

---

## 2. Mark as Winner

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

### Expected UI (admin)

On an **Application** record, command menu → **Run workflow → Mark as Winner**.

---

## Per-workspace checklist

| Step | Apply to Brief | Mark as Winner |
| --- | --- | --- |
| Trigger | Manual, single **Opportunity** | Manual, single **Application** |
| Action | Create **Application** | Update linked **Opportunity** |
| Published label | **Apply** (on brief) | **Mark as Winner** (on application) |
| Who runs it | Partner (WORKFLOWS flag) | Admin / Partner Ops |

Repeat for each workspace after install. Workflows are workspace metadata — they do not
travel with `deploy` / `install`.
