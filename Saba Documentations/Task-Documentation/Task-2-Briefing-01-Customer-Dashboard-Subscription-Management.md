# Task 2 — Briefing 01: Customer List Dashboard + Subscription Management

**Status:** FIRST MILESTONE COMPLETE — Phase 3 (build remaining features) not started
**Requested by:** Enzo Becker (Product Owner)
**Assigned to:** Saba
**Briefing doc:** [Briefing 01 — Google Doc](https://docs.google.com/document/d/1B602uqZ2yp7eXqZFODyUbPjB9mDrQIHEpIUhMGGCODo/edit?usp=sharing)
**Last updated:** 2026-03-10

---

## 1. What Enzo Asked For (Full Requirements)

### 1.1 Purpose

A dashboard that is the primary operational surface for teams to find, segment, and manage customers and their active subscriptions. It must answer within seconds:
- "Which customers need action today?"
- "Which subscriptions are at risk / expiring / paused / unpaid / need renewal?"
- "What's the current status of access, payment, and key milestones for a given customer?"
- "How do I apply a subscription change (pause, extension, payment plan change) safely and auditable?"

### 1.2 Target Users

| Team | Role |
|------|------|
| Customer Ops / Backoffice | Primary — daily operations, manage subscriptions |
| Finance | Secondary — payment status, collections context |
| Sales | Secondary — renewal upsell, contract follow-up handoff |

### 1.3 User Journeys

**Journey A — Daily Operations: "Work my list"**
- Open dashboard, select Smart View or apply filters
- See list with action-relevant columns
- Pick a row → open Subscription Detail
- Perform action (pause, extend, payment change, note, task)
- System updates: timeline + audit trail, derived dates, access policies, tasks/reminders
- Go back to list, continue with next item

**Journey B — "Pause for 4 weeks with certificate"**
- Search customer by name/email → open subscription
- Select Action: Pause / Freeze
- Enter: pause start date (default today), pause duration, reason (dropdown + free text), evidence attachment flag, whether coaching access pauses or remains
- System preview shows: new end date, impact on entitlements, any conflicts
- Confirm → system writes: immutable audit event, updated end date, case/task if approval required, updates access state per policy

**Journey C — "Extend existing subscription"**
- Renewal contract signed or manually triggered
- Open subscription → Action: Extend / Renew
- Enter: extension term (months/weeks), new pricing/offer reference, link renewal contract (Contract ID)
- System updates: end date, subscription term metadata, timeline event "renewed", optionally generates next invoice logic

**Journey D — "Switch to installments"**
- Customer requests payment terms change, or Finance triggers it
- Open subscription → Action: Payment plan change
- Edit: payment mode (upfront vs installments), schedule (due dates, amounts), installment pause
- System creates: updated payment schedule, flags for Finance dashboard, any required approvals

**Journey E — "Customer buys different product"**
- Customer has Coaching; now buys Training
- System creates new subscription object (not extension of old one)
- Both visible in customer list, clearly labeled by product type
- Each managed independently

### 1.4 Dashboard UX Requirements

**List View — Two Modes:**
- Customer-centric (one row per customer, shows primary subscription summary + counts)
- Subscription-centric (one row per subscription — recommended default for Ops)

**Columns (minimum viable):**

| Column | Description |
|--------|------------|
| Customer Name | |
| Primary Email | |
| Subscription Type | e.g., Coaching / Training |
| Subscription Status | Active / Paused / Pending Access / Ending Soon / Ended |
| Contract Signed Date | |
| Contract Start Date | |
| Program Start Date | |
| Subscription End Date | |
| Payment Status | Paid / Installments / Overdue / In dispute |
| Offer/Discount Tag | e.g., "Spring Promo -20%" |
| Access Status | Active / Not granted / Paused / Withdrawn |
| Last Touchpoint | Timestamp + channel icon |
| Next Action / Due Date | If follow-up exists |
| Owner | Optional but very useful |

**Filters (must be combinable):**
- Date ranges: signed date, end date, program start
- Status filters: subscription status, payment status, access status
- Product filters: subscription type, offer/discount
- Operational: "needs action", "no touchpoint in X days", "has open case", "missing required data"

**Smart Views (saved cohorts):**
- Save filter sets as named Smart Views
- Shareable across teams/roles
- Show count and last updated timestamp
- Examples: "Access not granted after signing", "Expiring in 60 days", "Paused subscriptions", "Overdue payments", "No touchpoint in 14 days"

**Bulk Actions (Phase 2 but design-ready):**
- Create follow-up tasks for all in view
- Export list (CSV)
- Apply tags
- Bulk schedule reminders

### 1.5 Subscription Detail View

**Summary Header:**
- Customer + subscription type
- Status pills: Subscription / Payment / Access
- Key dates: signed / start / program start / end
- Offer/discount summary
- Owner & team

**Actions (with guided workflows):**
- Pause / Freeze
- Extend / Renew
- Payment plan change (incl. installment pause)
- Update program start date
- Add note / create follow-up task
- Open case (exception escalation)

Each action must:
- Show preview impact (end date change, access impact)
- Enforce guardrails (see section 1.6)
- Write an audit event

**Timeline / Audit:**
- Chronological feed of subscription events: created, access granted, payment received, paused, extended, payment plan changed, notes/tasks
- Filterable by event type

**Linked Objects:**
- Related contracts (original + renewals/amendments)
- Invoices/payments overview (read-only link to Finance view)
- Access history
- Communication feed snapshot

### 1.6 Rules & Guardrails (non-negotiable)

- No silent changes — every mutation generates an immutable audit event
- Pause duration max X without approval (configurable)
- Cannot pause an already ended subscription
- Cannot create negative end dates / overlap issues
- Renewal must reference a contract (or explicit manual override with reason)
- Policy-driven access behavior (pause → access pauses or remains depending on product rules)
- Withdrawal due to non-payment controlled by finance policy
- Permissions: who can pause? who can change payment plan? who can renew? Backoffice vs Finance role splits.

### 1.7 Definition of Done (from Enzo)

- Filter customers/subscriptions and save Smart Views
- Execute Pause with preview + audit
- Execute Extend/Renew with end date recalculation + audit
- Execute Payment plan change and see updated payment mode/status
- See all changes in timeline + reflected in list immediately
- Basic permissioning (at least Admin vs Standard)
- List performance: usable at scale (thousands+ records)

---

## 2. What Was Built and Delivered

### 2.1 Code Changes (PR #14 + PR #16, merged to main)

**Action Buttons (3 components):**

| Action | File | What It Does |
|--------|------|-------------|
| Pause Subscription | `PauseSubscriptionAction.tsx` | Shows confirmation dialog, extends end date by fixed 4 weeks, sets accessStatus → PAUSED. Blocks if WITHDRAWN. |
| Extend / Renew | `ExtendSubscriptionAction.tsx` | Shows confirmation dialog, extends end date by fixed 3 months, sets accessStatus → ACTIVE. |
| Change Payment Plan | `ChangePaymentPlanAction.tsx` | Shows confirmation dialog, toggles paymentStatus between PAID and INSTALLMENTS. |

**Config + Routing:**

| File | What |
|------|------|
| `TobSubscriptionActionsConfig.tsx` | Registers 3 custom actions + inherits default actions (favorites, delete, export, etc.) |
| `SubscriptionSingleRecordActionKeys.ts` | Enum: `pause-subscription`, `extend-subscription`, `change-payment-plan` |
| `CoreObjectNameSingular.ts` | Added `TobSubscription = 'tobSubscription'` enum entry |
| `getActionConfig.ts` | Routes tobSubscription to custom config via enum switch case |

**Lingui Translations:**
- Ran `lingui extract` + `lingui compile` — all action labels compiled into 31 locale catalogs
- Labels display as readable text on production (not garbled hashes)

**Deploy Scripts (metadata — runs via Docker):**

| Script | Creates |
|--------|---------|
| `deploy/add-subscription-fields.sh` | 6 fields: Payment Status (SELECT), Access Status (SELECT), Subscription Type (SELECT), Offer/Discount Tag (TEXT), Last Touchpoint (DATE_TIME), Next Action/Due Date (DATE_TIME) |
| `deploy/create-subscription-views.py` | 5 Smart Views: Access Not Granted, Expiring in 60 Days, Paused Subscriptions, Overdue Payments, No Touchpoint 14 Days |

**Docker-compose:**
- Added `setup-subscriptions` one-shot service that runs deploy scripts automatically after twenty-server is healthy (internal Docker network, no Cloudflare needed)

### 2.2 What Works on Production (verified 2026-03-11 via Playwright)

| Feature | Status | Verified |
|---------|--------|----------|
| Subscription list (583 records) | ✅ Works | Screenshot evidence |
| 6 custom fields visible on subscription records | ✅ Works | Screenshot evidence |
| Action button labels (Pause, Extend, Change Payment Plan) | ✅ Readable | Screenshot evidence |
| Pause action — executes, sets Access Status to Paused | ✅ Works | Tested on QA-TEST-RECORD |
| Extend action — executes, sets Access Status to Active, updates End Date | ✅ Works | Tested on QA-TEST-RECORD |
| Change Payment Plan — executes, sets Payment Status to Installments | ✅ Works | Tested on QA-TEST-RECORD |
| Timeline / audit trail shows all changes | ✅ Works | Screenshot evidence |
| Smart View: Access Not Granted | ✅ Works | Clicked, loads without crash |
| Smart View: Expiring in 60 Days | ✅ Works | Clicked, loads without crash |
| Smart View: Paused Subscriptions | ✅ Works | Clicked, loads without crash |
| Smart View: Overdue Payments | ✅ Works | Clicked, loads without crash |
| Smart View: No Touchpoint 14 Days | ✅ Works | Clicked, loads without crash |
| Docker-compose auto-setup service | ✅ Works | Pablo confirmed |

### 2.3 What Does NOT Work on Production

All features working. No known bugs remaining in the first milestone.

---

## 3. What Is Left To Do (from Enzo's Requirements)

### 3.1 Features Never Built

| # | Feature | Enzo's Requirement | Current State |
|---|---------|-------------------|---------------|
| 1 | Pause guided workflow | Start date, duration input, reason dropdown, evidence attachment, conflict check, preview impact, approval flow | Fixed 4-week confirm dialog only |
| 2 | Extend guided workflow | Extension term input, pricing/offer reference, link contract ID, preview impact | Fixed 3-month confirm dialog only |
| 3 | Payment plan change workflow | Payment mode, schedule editing, amounts, installment pause, Finance flags | Toggle between 2 values only |
| 4 | List columns | 14+ columns: Email, Type, Status, Dates, Payment, Access, Touchpoint, Owner | Only 4 columns: Name, Creation date, Created by, Last update |
| 5 | Customer-centric vs Subscription-centric toggle | Two view modes for the list | Only subscription-centric |
| 6 | Detail view summary header | Status pills, key dates, owner, offer summary at top | Just a flat field list |
| 7 | Guardrails | Max pause duration, no overlap, renewal must reference contract, approval flows | Only checks WITHDRAWN status |
| 8 | Linked objects | Related contracts, invoices, access history, communication feed | Not built |
| 9 | Combinable filters (AND/OR) | Filter groups with AND/OR logic | Basic Twenty filters only |
| 10 | Bulk actions (Phase 2) | Follow-up tasks, CSV export, tags, bulk reminders | Not built |
| 11 | Role-based permissions | Backoffice vs Finance role splits | Basic canUpdate check only |
| 12 | Parallel subscriptions handling | Multiple subscriptions per customer, independently managed | Not explicitly handled |

---

## 4. Execution Plan (Phases)

### Phase 1: QA Testing (find all bugs)

**Goal:** Properly test everything we built on production via Playwright. Follow master document: SMOKE + MAT + AT + GUI with screenshots. Find ALL bugs. Document them. DO NOT FIX.

**Scope:**
- Click each of the 5 Smart Views → screenshot result (working or error)
- Click Pause action on a subscription → screenshot dialog → try to confirm → screenshot result
- Click Extend action → same
- Click Change Payment Plan action → same
- Check timeline after any successful action → screenshot
- Check all 6 custom fields on a record → screenshot
- Check browser console for errors on each step
- Document every bug found with severity, screenshot, and reproduction steps

**Output:** QA Report with pass/fail for every test case

**AI stops after Phase 1 — human reviews QA report and gives command to proceed.**

### Phase 2: Fix Bugs

**Goal:** Fix every bug found in Phase 1.

**Scope:** Depends on Phase 1 findings. Known issues so far:
- Smart View filters broken (all 5)
- Action button functionality untested (may have bugs)

**After fixing:** Re-test everything fixed via Playwright to confirm fixes work.

**AI stops after Phase 2 — human reviews fixes and gives command to proceed.**

### Phase 3: Build Remaining Features

**Goal:** Implement everything from Enzo's briefing that hasn't been built yet (see Section 3.1).

**This phase will be broken into sub-phases (3.1, 3.2, 3.3, etc.) when we start it.** Each sub-phase will cover one feature or group of related features. We don't define the sub-phases now — we define them when we start Phase 3, because by then we'll have:
- QA results from Phase 1
- Bug fixes from Phase 2
- Possibly feedback from Enzo
- A clearer picture of priorities and effort

**Each sub-phase follows the master document quality algorithm:**
```
WRITE → TEST (SMOKE + MAT + AT + GUI) → OPTIMIZE → RE-TEST → DONE → AI STOPS
```

**AI stops after each sub-phase — human reviews and gives command to proceed.**

### Phase 4: Full QA Testing

**Goal:** Test the entire Task 2 deliverable end-to-end. Per master document Section 8.

**Scope:**
- Run full QA 2 times (per master document)
- SMOKE TEST all modules (not just subscriptions — verify no regressions)
- MAT on VALID DATA (all subscription features with real data)
- AT on INVALID DATA (bad inputs, edge cases, permission violations)
- GUI verification via screenshots (every feature, every screen)
- Document everything in QA report
- DO NOT FIX bugs — document and wait for human review

**Output:** Final QA Report

**Human reviews → gives command to fix → fix → re-test → deploy → verify on production → Enzo tests.**

---

## 5. Timeline / History

| Date | What Happened |
|------|--------------|
| 2026-03-06 | Task received from Enzo (Briefing 01) |
| 2026-03-07 | Pablo completed data migration (Subscriptions, Contracts, Customers, Contacts) |
| 2026-03-09 | Pablo recreated objects with correct field types (Date and Time, Number) |
| 2026-03-10 | Built action buttons, deploy scripts, Smart Views. PR #8 created and merged. |
| 2026-03-10 | Found broken on production: garbled labels, missing fields. Reverted (PR #9). |
| 2026-03-10 | Code audit: found 6 problems, 0 code bugs in hooks/components. |
| 2026-03-10 | Fixed Lingui translations + type-safe routing. PR #10 merged. Reverted (PR #11). |
| 2026-03-10 | Added docker-compose setup-subscriptions service (Pablo's suggestion). |
| 2026-03-10 | Final PR #12 merged with all fixes. Pablo ran docker compose up. |
| 2026-03-10 | Production verification: labels readable ✅, fields visible ✅, Smart Views crash ❌. |
| 2026-03-10 | Honest assessment: ~30-40% of Enzo's requirements built. Smart Views broken. Actions untested. |
| 2026-03-10 | Phase 1 QA via Playwright: Actions tested on QA-TEST-RECORD — all 3 work. Smart Views all crash. |
| 2026-03-10 | Phase 2: Fixed Smart View filter values (JSON arrays for SELECT, DIRECTION_AMOUNT_UNIT for dates). |
| 2026-03-10 | Reverted PR #12, created PR #14 with all fixes. Merged to main. |
| 2026-03-10 | Pablo ran docker compose up. Smart View delete mutation failed ($id: ID! vs String!). Duplicate views created. |
| 2026-03-11 | Pablo re-ran script with corrected delete mutation. Saba cleaned up duplicate views manually. |
| 2026-03-11 | All 16 tests pass on production. First milestone of Briefing 01 COMPLETE. |
| 2026-03-11 | PR #16 merged: fix $id: String! in deploy script for future deploys. |

---

## 6. Key Files

| File | Purpose |
|------|---------|
| `packages/twenty-front/src/modules/action-menu/actions/record-actions/constants/TobSubscriptionActionsConfig.tsx` | 3 custom action configs |
| `packages/twenty-front/src/modules/action-menu/actions/record-actions/single-record/subscription-actions/components/PauseSubscriptionAction.tsx` | Pause action component |
| `packages/twenty-front/src/modules/action-menu/actions/record-actions/single-record/subscription-actions/components/ExtendSubscriptionAction.tsx` | Extend action component |
| `packages/twenty-front/src/modules/action-menu/actions/record-actions/single-record/subscription-actions/components/ChangePaymentPlanAction.tsx` | Change Payment action component |
| `packages/twenty-front/src/modules/action-menu/actions/utils/getActionConfig.ts` | Routes tobSubscription to custom config |
| `packages/twenty-front/src/modules/object-metadata/types/CoreObjectNameSingular.ts` | TobSubscription enum entry |
| `deploy/add-subscription-fields.sh` | Creates 6 metadata fields |
| `deploy/create-subscription-views.py` | Creates 5 Smart Views (currently broken filters) |
| `deploy/docker-compose.yml` | setup-subscriptions service |

---

## 7. Next Action

**Phase 1 (QA): COMPLETE** — all 16 tests pass on production.
**Phase 2 (Fix bugs): COMPLETE** — Smart View filters fixed, $id: String! fix merged.
**Next: Phase 3** — Build remaining features from Enzo's requirements (guided workflows, list columns, guardrails, etc.). Sub-phases to be defined when we start.
