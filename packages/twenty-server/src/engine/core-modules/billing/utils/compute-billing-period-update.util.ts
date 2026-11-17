/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { getCurrentPeriodMaxSeats } from 'src/engine/core-modules/billing/utils/get-current-period-max-seats.util';

type StoredBillingPeriod = Pick<
  BillingSubscriptionEntity,
  | 'currentPeriodStart'
  | 'currentPeriodEnd'
  | 'currentPeriodMaxSeats'
  | 'billingSubscriptionItems'
>;

type BillingPeriodUpdate = {
  previousPeriodStart?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  previousPeriodMaxSeats?: number;
  currentPeriodMaxSeats?: number | null;
};

export const computeBillingPeriodUpdate = ({
  incomingPeriodStart,
  storedSubscription,
  renewalDate,
}: {
  incomingPeriodStart: Date | undefined;
  storedSubscription: StoredBillingPeriod | null;
  renewalDate?: Date;
}): BillingPeriodUpdate => {
  if (!isDefined(storedSubscription) || !isDefined(incomingPeriodStart)) {
    return {};
  }

  const { currentPeriodStart, currentPeriodEnd } = storedSubscription;
  const currentPeriodMaxSeats = getCurrentPeriodMaxSeats(storedSubscription);

  if (incomingPeriodStart.getTime() > currentPeriodStart.getTime()) {
    return {
      previousPeriodStart: currentPeriodStart,
      previousPeriodMaxSeats: currentPeriodMaxSeats,
      currentPeriodMaxSeats: null,
    };
  }

  if (incomingPeriodStart.getTime() < currentPeriodStart.getTime()) {
    return { currentPeriodStart, currentPeriodEnd, currentPeriodMaxSeats };
  }

  if (renewalDate?.getTime() === incomingPeriodStart.getTime()) {
    return { currentPeriodMaxSeats: null };
  }

  return { currentPeriodMaxSeats };
};
