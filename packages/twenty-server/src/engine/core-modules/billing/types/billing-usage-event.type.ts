/* @license Enterprise */

import { type NonNegative } from 'type-fest';

import { type BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { type BillingDimensions } from 'src/engine/core-modules/billing/types/billing-dimensions.type';

export type BillingUsageEvent = {
  eventName: BillingMeterEventName;
  value: NonNegative<number>;
  dimensions?: BillingDimensions;
};
