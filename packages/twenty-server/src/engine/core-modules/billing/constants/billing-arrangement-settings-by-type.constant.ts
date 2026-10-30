/* @license Enterprise */

import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementSettingKey } from 'src/engine/core-modules/billing/types/billing-arrangement-setting-key.type';

// An optional endsAt left empty means the arrangement has no end date
export const BILLING_ARRANGEMENT_SETTINGS_BY_TYPE: Record<
  BillingArrangementType,
  {
    required: BillingArrangementSettingKey[];
    optional: BillingArrangementSettingKey[];
  }
> = {
  // endsAt: end of the commitment term
  [BillingArrangementType.COMMITTED_SEATS]: {
    required: ['seats', 'seatCapMode'],
    optional: ['stripePriceId', 'endsAt'],
  },
  // endsAt: when the seats stop being free
  [BillingArrangementType.FREE_SEATS]: {
    required: ['seats'],
    optional: ['endsAt'],
  },
  // endsAt: when the discount stops, empty for a forever coupon
  [BillingArrangementType.COUPON]: {
    required: ['stripeCouponId'],
    optional: ['endsAt'],
  },
  // endsAt: the new trial end
  [BillingArrangementType.TRIAL_EXTENSION]: {
    required: ['endsAt'],
    optional: [],
  },
  // endsAt: when the plan's workspace AI credits come back
  [BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE]: {
    required: ['creditAllowanceMicro'],
    optional: ['endsAt'],
  },
  // endsAt: when the plan's per-user AI credits come back
  [BillingArrangementType.USER_CREDIT_ALLOWANCE]: {
    required: ['creditAllowanceMicro'],
    optional: ['endsAt'],
  },
  // endsAt: when the default limit comes back
  [BillingArrangementType.LIMIT_OVERRIDE]: {
    required: ['usageLimitId'],
    optional: ['endsAt'],
  },
  // No endsAt: a refund happens once
  [BillingArrangementType.REFUND]: {
    required: ['stripeCreditNoteId'],
    optional: [],
  },
  // No endsAt: the grant happens once, its expiry lives on the grant
  [BillingArrangementType.CREDIT_GRANT]: {
    required: ['creditGrantId'],
    optional: [],
  },
};
