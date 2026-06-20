# XO Pure Compensation Metric Mapping (Validation Working Draft)

This working note captures what is already persisted in XO Pure and what is still unverified against the authoritative compensation plan.

## Current persisted metric fields

Source mappings are implemented in:
- `packages/twenty-apps/internal/xopure-crm/src/supabase-sync/utils/map-supabase-record.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-order.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-order-line.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-ambassador.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-commission.object.ts`

## Mapped volume and commission fields

- `orders` → `xopureOrder.cvAmount` from `record.cv_amount`.
- `order_items` → `xopureOrderLine.cvAmount` from `record.cv_amount`.
- `commission_ledger` → `xopureCommission.baseCvAmount` from `record.base_cv_amount`.
- `commission_ledger` → `xopureCommission.amountCents` from `record.amount_cents`.
- `xopureAmbassador.personalVolumeCents` from `record.personal_volume_cents`.
- `xopureAmbassador.teamVolumeCents` from `record.team_volume_cents`.
- `xopureAmbassador.attributedRevenueCents` from `record.team_volume_cents` (current implementation behavior; re-check source semantics before treating this as attributed revenue).

## Order and payout-state fields

- `xopureOrder` includes `totalCents`, `subtotalCents`, `shippingCents`, `taxCents`, `discountCents`, `refundCents`, `commissionable`, `buyerType`, `status`, `fulfillmentStatus`, and payment-related fields.
- `xopureCommission` includes status values `PENDING`, `APPROVED`, `PAID`, `VOID`, `HELD` after map normalization.
- `xopurePayment` and `xopurePayoutBatch` are present and available for dashboards but are not yet used for native ambassador payout reporting.

## Known gaps vs canonical plan model

- `affiliateType` (Customer / Referral / Elite Pack) is not persisted explicitly.
- Generation unlocks and access (`L1`–`L4`, generation access tables/flags) are not explicitly persisted.
- `PCV`, explicit `GV`/`PV` canonical derivations are not explicitly persisted; current fields appear to represent likely aliases that need confirmation.
- Canonical payout lifecycle (`held → payable → paid`) is not explicitly enforced on native commission objects today.
- FTC order taxonomy is not explicit beyond `buyerType`.
- `xopureAmbassador.attributedRevenueCents` sourcing is ambiguous and should be validated against source definitions.

## Acceptance gate before using canonical names in dashboards

Before renaming dashboard cards to canonical compensation terms:

1. Confirm that `xopureOrder.cvAmount` and `xopureOrderLine.cvAmount` are canonical `CV`.
2. Confirm that `xopureAmbassador.personalVolumeCents` is canonical `PV`.
3. Confirm that `xopureAmbassador.teamVolumeCents` is canonical `GV` (or explicitly map/rename if not).
4. Confirm source field for attributed revenue before keeping `attributedRevenueCents` as its display source.
5. Persist and wire canonical `affiliateType` and generation access where plan logic depends on them.
6. Normalize commission/payout status to a canonical lifecycle and wire dashboard copy accordingly.
