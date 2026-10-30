/* @license Enterprise */

import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';

export type BillingArrangementPeriod = Pick<
  BillingArrangementEntity,
  'type' | 'startsAt' | 'endsAt' | 'revokedAt'
>;
