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
    optional: ['stripePriceId', 'endsAt'],
  },
  [BillingArrangementType.FREE_SEATS]: {
    required: ['seats'],
    optional: ['endsAt'],
  },
  [BillingArrangementType.COUPON]: {
    required: ['stripeCouponId'],
    optional: ['endsAt'],
  },
  [BillingArrangementType.TRIAL_EXTENSION]: {
    required: ['endsAt'],
    optional: [],
  },
  [BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE]: {
    required: ['creditAllowanceMicro'],
    optional: ['endsAt'],
  },
  [BillingArrangementType.USER_CREDIT_ALLOWANCE]: {
    required: ['creditAllowanceMicro'],
    optional: ['endsAt'],
  },
  [BillingArrangementType.LIMIT_OVERRIDE]: {
    required: ['usageLimitId'],
    optional: ['endsAt'],
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
