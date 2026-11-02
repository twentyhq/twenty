/* @license Enterprise */

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

export const computeWorkspaceCreditAllowanceForPeriodMicro = ({
  creditAllowanceMicro,
  interval,
  isTrialing,
}: {
  creditAllowanceMicro: number;
  interval: SubscriptionInterval;
  isTrialing: boolean;
}): number =>
  !isTrialing && interval === SubscriptionInterval.Year
    ? creditAllowanceMicro * 12
    : creditAllowanceMicro;
