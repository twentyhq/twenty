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

  if (incomingPeriodStart.getTime() < currentPeriodStart.getTime()) {
    return { currentPeriodStart, currentPeriodEnd };
  }

  return {};
};
