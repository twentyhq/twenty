/* @license Enterprise */

import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { type BillingArrangementPeriod } from 'src/engine/core-modules/billing/types/billing-arrangement-period.type';

export type ScopedBillingArrangementPeriod = BillingArrangementPeriod &
  Pick<BillingArrangementEntity, 'usageLimitId'>;
