# Subscription Period System — Current Status

**Date:** 2026-03-20
**Branch:** `feature/subscription-period-system`
**Status:** Code complete. Waiting for Pablo's go-ahead to deploy.

## What was built

3-layer subscription system replacing direct field mutation:
- **Subscription** — computed fields only (status, finalEndDate, pauseDays, accessStatus)
- **Subscription Period** — every active/pause stretch is its own record
- **Change Request** — approval workflow for all subscription changes

## Files changed (11 files, 11 commits)

### Deploy scripts
- `deploy/create-subscription-period-objects.sh` — NEW: creates subscriptionPeriod + subscriptionPeriodChangeRequest objects with all fields and relations (including requestedBy/processedBy to workspaceMember)
- `deploy/add-subscription-fields.sh` — MODIFIED: added subscriptionStatus, inactiveReason, historicalPauseDays fields

### Frontend
- `CoreObjectNameSingular.ts` — added SubscriptionPeriod, SubscriptionPeriodChangeRequest
- `PauseSubscriptionFormModal.tsx` — REWRITTEN: creates Change Request instead of direct update, sets requestedById
- `ExtendSubscriptionAction.tsx` — REWRITTEN: creates Change Request instead of direct update, sets requestedById
- `useRecalculateSubscription.ts` — NEW: computes subscription fields from periods, writes to both finalEndDate and endDate
- `ApproveChangeRequestAction.tsx` — NEW: fetches all periods, lazy-inits from subscription if none exist, shortens active period on pause, creates periods, marks CR approved, recalculates
- `RejectChangeRequestAction.tsx` — NEW: sets CR to rejected with processedBy/processedAt
- `ChangeRequestSingleRecordActionKeys.ts` — NEW: enum
- `ChangeRequestActionsConfig.tsx` — NEW: action config (approve/reject visible only for PENDING records)
- `getActionConfig.ts` — MODIFIED: added SubscriptionPeriodChangeRequest case

## Deployment steps (in order)

1. Run `deploy/create-subscription-period-objects.sh` against CRM
2. Run `deploy/add-subscription-fields.sh` against CRM
3. Merge `feature/subscription-period-system` into main (deploys frontend)

**Step 1+2 MUST happen before step 3.** Frontend will error if objects don't exist yet.

## Pablo coordination

- Pablo confirmed Dagster writes startDate + duration to subscriptions. New fields are safe — Dagster never overwrites them.
- No migration script needed. The approve action lazy-initializes: if a subscription has no periods yet, it auto-creates an initial period from startDate/endDate on first approval.
- Message drafted at `C:\Users\User\Desktop\deploy-message-for-pablo.txt` — waiting for user to send.

## Key design decisions

- Field names: `requestStatus` (not `status`) and `subscriptionStatus` (not `status`) to avoid Twenty built-in field collisions
- Recalculation writes to BOTH `finalEndDate` (new) and `endDate` (old) so smart views like "Expiring in 60 Days" keep working
- CR status is set to APPROVED only after periods are successfully created (prevents inconsistent state)
- Period query limit set to 200 (default is 60)

## Spec and plan docs

- Design spec: `docs/superpowers/specs/2026-03-20-subscription-period-system-design.md`
- Implementation plan: `docs/superpowers/plans/2026-03-20-subscription-period-system.md`

## What is NOT implemented (deferred)

- Cancellation flows (Cancellation – Customer, Cancellation – TOB, Reversal, Contract expiry) — spec acknowledges this, designed in follow-up
- Validation: "start date within subscription" and "no concurrent pending requests" — low risk for internal CRM, can add later
- User-selectable pause start date (currently always "now")
