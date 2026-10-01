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

// Stripe only reports the current window, so the boundary a period moves off must be captured here or is lost;
// the rollover bounds the usage it settles with it, so every subscription write resolves period fields through this.
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

  // Stripe never moves a period backwards, so an older window is a late event and must not rewind the boundary.
  if (incomingPeriodStart.getTime() < currentPeriodStart.getTime()) {
    return { currentPeriodStart, currentPeriodEnd };
  }

  return {};
};
