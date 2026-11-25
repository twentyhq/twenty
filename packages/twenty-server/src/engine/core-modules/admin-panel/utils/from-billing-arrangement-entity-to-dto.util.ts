import { isDefined } from 'twenty-shared/utils';

import { type AdminPanelBillingCouponDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-billing-coupon.dto';
import { type AdminPanelWorkspaceBillingArrangementDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing-arrangement.dto';
import { type UserInfoDTO } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { ADMIN_MANAGED_BILLING_ARRANGEMENT_TYPES } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';
import { getBillingArrangementStatus } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-status.util';
import { type UsageLimitDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-limit.dto';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

export const fromBillingArrangementEntityToDto = ({
  arrangement,
  now,
  operatorsById,
  usageLimitsById,
  couponsById,
}: {
  arrangement: BillingArrangementEntity;
  now: Date;
  operatorsById: Map<string, UserInfoDTO>;
  usageLimitsById: Map<string, UsageLimitDTO>;
  couponsById: Map<string, AdminPanelBillingCouponDTO>;
}): AdminPanelWorkspaceBillingArrangementDTO => ({
  id: arrangement.id,
  type: arrangement.type,
  label: arrangement.label,
  comment: arrangement.comment,
  seats: arrangement.seats,
  seatCapMode: arrangement.seatCapMode,
  stripeDiscountId: arrangement.stripeDiscountId,
  stripeCouponId: arrangement.stripeCouponId,
  coupon: isDefined(arrangement.stripeCouponId)
    ? (couponsById.get(arrangement.stripeCouponId) ?? null)
    : null,
  creditAllowance: isDefined(arrangement.creditAllowanceMicro)
    ? toDisplayCredits(arrangement.creditAllowanceMicro)
    : null,
  stripeCreditNoteId: arrangement.stripeCreditNoteId,
  creditGrantId: arrangement.creditGrantId,
  usageLimit: isDefined(arrangement.usageLimitId)
    ? (usageLimitsById.get(arrangement.usageLimitId) ?? null)
    : null,
  startsAt: arrangement.startsAt,
  endDate: getBillingArrangementEndDate(arrangement),
  status: getBillingArrangementStatus({ arrangement, now }),
  isManageable: ADMIN_MANAGED_BILLING_ARRANGEMENT_TYPES.includes(
    arrangement.type,
  ),
  grantedBy: isDefined(arrangement.grantedByUserId)
    ? (operatorsById.get(arrangement.grantedByUserId) ?? null)
    : null,
  revokedBy: isDefined(arrangement.revokedByUserId)
    ? (operatorsById.get(arrangement.revokedByUserId) ?? null)
    : null,
  createdAt: arrangement.createdAt,
});
