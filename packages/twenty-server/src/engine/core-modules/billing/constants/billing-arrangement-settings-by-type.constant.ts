/* @license Enterprise */

import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementSettingKey } from 'src/engine/core-modules/billing/types/billing-arrangement-setting-key.type';

export const BILLING_ARRANGEMENT_SETTINGS_BY_TYPE: Record<
  BillingArrangementType,
  {
    required: BillingArrangementSettingKey[];
    optional: BillingArrangementSettingKey[];
  }
> = {
  [BillingArrangementType.COMMITTED_SEATS]: {
    required: ['seats', 'seatCapMode'],
    optional: ['stripePriceId'],
  },
  [BillingArrangementType.FREE_SEATS]: { required: ['seats'], optional: [] },
  [BillingArrangementType.STRIPE_COUPON]: {
    required: ['stripeCouponId'],
    optional: [],
  },
  [BillingArrangementType.TRIAL_EXTENSION]: { required: [], optional: [] },
  [BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE]: {
    required: ['creditAllowanceMicro'],
    optional: [],
  },
  [BillingArrangementType.USER_CREDIT_ALLOWANCE]: {
    required: ['creditAllowanceMicro'],
    optional: [],
  },
  [BillingArrangementType.LIMIT_OVERRIDE]: {
    required: ['usageLimitId'],
    optional: [],
  },
  [BillingArrangementType.REFUND]: {
    required: ['stripeCreditNoteId'],
    optional: [],
  },
  [BillingArrangementType.CREDIT_GRANT]: {
    required: ['creditGrantId'],
    optional: [],
  },
};
