/* @license Enterprise */

import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';

export type BillingArrangementSettingKey = keyof Pick<
  BillingArrangementEntity,
  | 'seats'
  | 'seatCapMode'
  | 'stripePriceId'
  | 'stripeCouponId'
  | 'creditAllowanceMicro'
  | 'stripeCreditNoteId'
  | 'creditGrantId'
  | 'usageLimitId'
  | 'endsAt'
>;
