/* @license Enterprise */

import { type NonNegative } from 'type-fest';

import { type BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';

export type BillingUsageEvent = {
  eventName: BillingMeterEventName;
  value: NonNegative<number>;
};
