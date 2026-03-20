# Subscription Period System — Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Source:** TOB-OS Change-Request document, Point #4

## Problem

The current subscription system stores `endDate`, `pauseDays`, and `accessStatus` directly on the Subscription object. Pause and Extend actions overwrite these fields with no audit trail, no approval workflow, and no way to reconstruct what changed or why.

## Solution

Replace direct field mutation with a 3-layer system: Subscription → Periods → Change Requests. Every change flows through a Change Request, which on approval creates or modifies Periods. The Subscription's key fields are recalculated from its Periods.

## Data Model

### Object 1 — Subscription (existing: `tobSubscription`, modified)

Fields that remain unchanged:
- `paymentStatus` (Select: PAID, INSTALLMENTS, OVERDUE, IN_DISPUTE)
- `subscriptionType` (Select: COACHING, TRAINING, CERTIFICATION)
- `offerDiscountTag` (Text)
- `lastTouchpoint` (DateTime)
- `nextActionDueDate` (DateTime)
- All existing identity and relation fields

Fields that become system-computed (written only by the recalculation logic, never manually):
- `status` — Select: ACTIVE, INACTIVE
- `inactiveReason` — Select: PAUSE, CANCELLATION_CUSTOMER, CANCELLATION_TOB, REVERSAL, CONTRACT_EXPIRY (only set when status = INACTIVE)
- `finalEndDate` — DateTime, calculated as the latest end date across all periods
- `pauseDays` — Number, sum of all pause-type period durations
- `accessStatus` — derived from status + inactiveReason (existing field, now system-managed)
- `historicalPauseDays` — Number, carries forward pre-migration pause days that cannot be reconstructed as Periods

### Object 2 — Subscription Period (new: `subscriptionPeriod`)

| Field | Type | Description |
|---|---|---|
| `subscription` | Relation → tobSubscription | Parent subscription |
| `periodType` | Select: ACTIVE, PAUSE | Type of period |
| `startDate` | Date | Start of this period |
| `endDate` | Date | End of this period (null if ongoing) |
| `source` | Select: CONTRACT, CHANGE_REQUEST, MANUAL | How this period was created |
| `changeRequest` | Relation → subscriptionPeriodChangeRequest (nullable) | Link to originating change request |

Invariant: every moment of a subscription's lifetime is covered by exactly one period. No gaps, no overlaps.

### Object 3 — Subscription Period Change Request (new: `subscriptionPeriodChangeRequest`)

| Field | Type | Description |
|---|---|---|
| `subscription` | Relation → tobSubscription | Target subscription |
| `requestedBy` | Relation → workspaceMember | Who submitted the request |
| `periodType` | Select: ACTIVE, PAUSE | What period type to create |
| `startDate` | Date | Requested period start |
| `duration` | Number | Duration in days |
| `reason` | Text | Why this change is being requested |
| `notes` | Text (nullable) | Additional context or notes |
| `status` | Select: PENDING, APPROVED, REJECTED | Approval state |
| `proofReference` | Text | Ticket ID or document link |
| `processedBy` | Relation → workspaceMember (nullable) | Who approved or rejected |
| `processedAt` | DateTime (nullable) | When it was processed |

Any workspace member with update permissions on the subscription can approve or reject a Change Request. The person who submitted the request may also approve it (no four-eyes principle enforced at this stage).

## Flows

### Pause Subscription

1. User clicks "Pause Subscription" on a subscription record.
2. Modal collects: duration (days), reason, notes, proof reference.
3. On submit: a Change Request is created with `status: PENDING`, `periodType: PAUSE`.
4. Approver opens the Change Request, clicks "Approve".
5. On approval:
   - The current active period is shortened (its `endDate` set to the pause start date).
   - A new pause period is created (start = pause start, end = pause start + duration).
   - A new active period is created (start = pause end, end = old active period end + duration).
   - The Change Request's `processedBy` and `processedAt` are set.
6. The Subscription's computed fields are recalculated from all its Periods.

### Extend Subscription

1. User clicks "Extend / Renew" on a subscription record.
2. Confirmation dialog shows current end date and proposed new end date.
3. On submit: a Change Request is created with `status: PENDING`, `periodType: ACTIVE`.
4. On approval:
   - The last active period's `endDate` is set to the original end date (unchanged).
   - A new active period is created: start = old end date, end = old end date + duration, source = CHANGE_REQUEST, linked to this Change Request.
   - The Subscription's `finalEndDate` is recalculated.

This ensures every extension is its own Period with a clear audit trail back to its Change Request.

### Cancellation (deferred)

Cancellation flows (Cancellation – Customer, Cancellation – TOB, Reversal, Contract expiry) are not yet specified. They will follow the same Change Request pattern but require a `periodType` extension (e.g., CANCELLED) or a separate cancellation object. This will be designed in a follow-up spec. For now, `inactiveReason` values related to cancellation exist in the data model but are not populated by any flow.

### Reject Change Request

1. Approver opens a pending Change Request, clicks "Reject".
2. `status` is set to `REJECTED`, `processedBy` and `processedAt` are recorded.
3. No Periods are created or modified. Subscription remains unchanged.

## Recalculation Logic

Triggered after any Period is created, modified, or deleted:

1. Fetch all Periods for the subscription, ordered by `startDate` ascending.
2. `finalEndDate` = the maximum `endDate` across all periods.
3. `pauseDays` = sum of `(endDate - startDate)` in days for all periods where `periodType = PAUSE`. For migrated subscriptions that have a `historicalPauseDays` value, add that to the sum (see Migration section).
4. `status`:
   - Find the period with the latest `endDate` (the one that determines when the subscription ends).
   - If that `endDate` is in the future or null → ACTIVE
   - Otherwise → INACTIVE
5. `inactiveReason`: if INACTIVE and the last period by `startDate` is a PAUSE → PAUSE. Other inactive reasons (cancellation, reversal, contract expiry) are not yet populated — see Cancellation (deferred) section.
6. `accessStatus`: ACTIVE → ACTIVE, INACTIVE + PAUSE → PAUSED, INACTIVE + other → WITHDRAWN.

These values are written to the Subscription object so they remain available for filters, smart views, and exports.

## Validation Rules

Before approving a Change Request, the system validates:

1. **No past-date pauses**: The requested `startDate` must be today or in the future.
2. **No pause during pause**: If the subscription's current period at the requested `startDate` is already a PAUSE, the request is rejected with an error message.
3. **Start date within subscription**: The requested `startDate` must fall within an existing active period of this subscription.
4. **No concurrent approvals**: A subscription can only have one PENDING Change Request at a time. A new request cannot be submitted while another is pending.

## UI Changes

### Modified Actions

- **PauseSubscriptionAction**: Modal now creates a Change Request instead of directly updating the subscription. Form fields remain the same (duration, reason, notes) plus a new `proofReference` field.
- **ExtendSubscriptionAction**: Creates a Change Request instead of directly updating `endDate`.

### New Actions (on Change Request records)

- **ApproveChangeRequestAction**: Sets status to APPROVED, creates/modifies Periods, triggers recalculation.
- **RejectChangeRequestAction**: Sets status to REJECTED, records who rejected and when.

### Subscription Detail View

- Periods are visible as related records in the subscription's detail view (Twenty handles this automatically via the relation).
- Change Requests are also visible as related records.

## Migration Strategy

### Dependency on Pablo

Pablo must be involved before step 7 (migration) and step 8 (deployment). He currently relies on direct end-date values.

### Migration Script

For each existing `tobSubscription` that has a `startDate` and `endDate`:
1. Create one `subscriptionPeriod` with:
   - `periodType: ACTIVE`
   - `startDate` = subscription's start date
   - `endDate` = subscription's current end date
   - `source: CONTRACT`
2. If `pauseDays > 0`, the migration script does NOT retroactively create pause periods (we lack the exact dates). Instead, the current `pauseDays` value is copied to a new `historicalPauseDays` field on the subscription. The recalculation logic adds this to the computed `pauseDays` so no historical data is lost.
3. Run recalculation for all subscriptions and verify `finalEndDate` matches the old `endDate`.

### Rollback Plan

If migration produces incorrect data:
1. Delete all `subscriptionPeriod` records where `source = CONTRACT` (the ones created by migration).
2. The old `endDate`, `pauseDays`, and `accessStatus` fields are still on the subscription and were not modified — the system reverts to the old behavior.
3. Re-deploy the old Pause/Extend actions that write directly to the subscription.

### Rollout

1. Build everything (steps 1–6) without touching existing data. Note: between steps 4–5 and step 6, the system will be in a "request-only" state where Change Requests can be created but not yet approved. This is expected.
2. Step 3 adds new fields (`status`, `inactiveReason`, `historicalPauseDays`) — they start empty/null until the migration runs.
3. Pablo reviews migration script and confirms no external process still writes `endDate` directly.
4. Run migration script to create initial Periods.
5. Verify smart views and filters still work correctly.
6. Old direct-edit code paths are removed.

## Build Sequence

| Step | What | Pablo needed? |
|---|---|---|
| 1 | Create `subscriptionPeriod` custom object + fields (deploy script) | No |
| 2 | Create `subscriptionPeriodChangeRequest` custom object + fields (deploy script) | No |
| 3 | Add `status`, `inactiveReason`, `historicalPauseDays` fields to `tobSubscription` | No |
| 4 | Rewrite PauseSubscriptionAction → creates Change Request | No |
| 5 | Rewrite ExtendSubscriptionAction → creates Change Request | No |
| 6a | Build Approve/Reject actions on Change Request (creates/modifies Periods) | No |
| 6b | Build recalculation logic (recomputes Subscription fields from Periods) | No |
| 7 | Write migration script for existing subscriptions → initial Periods | **Yes** |
| 8 | Deploy, run migration, verify | **Yes** |

## End-to-End Test Plan

After implementation, test in the dev environment (login with prefilled test credentials):

1. Open a test subscription.
2. Click "Pause Subscription" → fill form → verify Change Request created with status PENDING.
3. Navigate to the Change Request → click "Approve".
4. Verify: Periods created correctly, Subscription's `finalEndDate` shifted, `status` and `pauseDays` updated.
5. Test "Extend / Renew" → same approval flow → verify end date extends.
6. Test "Reject" → verify subscription unchanged.
7. Check smart views (Paused Subscriptions, Expiring in 60 Days) still filter correctly.
