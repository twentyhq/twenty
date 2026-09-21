/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

type StoredBillingPeriod = {
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
};

type BillingPeriodBoundaryUpdate = {
  previousPeriodStart?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
};

// Stripe only ever reports the current window, so the boundary a period moves
// off is captured at the moment it moves or lost for good. The rollover needs
// it to bound the usage it settles, which is why every path that writes a
// subscription resolves its period fields through this.
export const resolveBillingPeriodBoundaryUpdate = ({
  incomingPeriodStart,
  storedSubscription,
}: {
  incomingPeriodStart: Date | undefined;
  storedSubscription: StoredBillingPeriod | null;
}): BillingPeriodBoundaryUpdate => {
  if (!isDefined(storedSubscription) || !isDefined(incomingPeriodStart)) {
    return {};
  }

  const { currentPeriodStart, currentPeriodEnd } = storedSubscription;

  if (incomingPeriodStart.getTime() > currentPeriodStart.getTime()) {
    return { previousPeriodStart: currentPeriodStart };
  }

  // Stripe never moves a period backwards, so an older window is an event
  // delivered late. Letting it land would rewind the boundary the rollover
  // settles against and leave it behind the one already recorded.
  if (incomingPeriodStart.getTime() < currentPeriodStart.getTime()) {
    return { currentPeriodStart, currentPeriodEnd };
  }

  return {};
};
