# Journey-CRM Specialist Learnings

> **Agent:** journey-crm-specialist
> **Created:** 2026-01-12
> **Updated:** 2026-01-12

---

## Discoveries

### MAP-001: Employee Lifecycle to Journey States
**Date:** 2026-01-12
**Context:** Initial agent design

Employee CRM lifecycle maps cleanly to Journey Engine:
- `offer_accepted` → Lead/Prospect in CRM
- `documents_pending` → Onboarding stage
- `training` → In Training stage
- `active` → Active Employee
- `offboarding` → Exiting stage
- `alumni` → Former Employee

**Implication:** Use consistent naming between journey states and CRM stages.

---

### MAP-002: Customer Lifecycle Journeys
**Date:** 2026-01-12
**Context:** Restaurant guest CRM design

Customer/guest journey states:
- `first_visit` → New Guest
- `loyalty_invited` → Invited
- `loyalty_member` → Member
- `regular` → Regular (3+ visits)
- `vip` → VIP (high spend/frequency)
- `churned` → Inactive (90+ days)

**Implication:** Timeouts drive churn detection; use `timeout_actions` for re-engagement.

---

## Assumptions

### A-001: Workspace Isolation
**Date:** 2026-01-12
**Assumption:** All CRM data respects workspace_id boundaries
**Validation needed:** Verify CRM queries filter by workspace

---

## Edge Cases

(None documented yet)

---

## Anti-Patterns

(None documented yet)

---

## Sync Patterns

### SYNC-001: Journey → CRM Update Pattern
**Date:** 2026-01-12
**Pattern:**
```
Entry Action (type: crm_update)
    ↓
Objective Layer schedules
    ↓
n8n dispatcher routes to CRM webhook
    ↓
CRM API called
    ↓
Objective marked complete/failed
```

**Key insight:** Use Objective Layer's retry logic for CRM reliability.

---

### SYNC-002: CRM → Journey Trigger Pattern
**Date:** 2026-01-12
**Pattern:**
```
CRM webhook fires on status change
    ↓
n8n receives webhook
    ↓
Map CRM status to journey event
    ↓
Call journey_transition or journey_start
    ↓
Journey Engine processes
```

**Key insight:** n8n is the translation layer between CRM events and Journey RPC.
