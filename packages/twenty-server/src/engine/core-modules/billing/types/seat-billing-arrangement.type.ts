/* @license Enterprise */

import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';

export type SeatBillingArrangement = Pick<
  BillingArrangementEntity,
  'type' | 'seats' | 'seatCapMode' | 'startsAt' | 'endsAt' | 'revokedAt'
>;
