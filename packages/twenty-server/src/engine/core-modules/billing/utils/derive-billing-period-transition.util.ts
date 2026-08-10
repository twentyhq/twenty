/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

export type BillingPeriodTransition = {
  closingPeriodStart: Date;
  closingPeriodEnd: Date;
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
};

// A subscription_cycle invoice is raised at the instant one period hands over
// to the next, and Stripe stamps it with the period it bills in advance. So its
// period_start is the transition instant: the closing period ends there and the
// new one starts there.
export const deriveBillingPeriodTransition = ({
  invoicePeriodStart,
  invoicePeriodEnd,
  subscriptionCurrentPeriodStart,
  subscriptionCurrentPeriodEnd,
  trialStart,
  isFirstPeriodAfterTrial,
}: {
  invoicePeriodStart: Date;
  invoicePeriodEnd: Date;
  subscriptionCurrentPeriodStart: Date;
  subscriptionCurrentPeriodEnd: Date;
  trialStart: Date | null | undefined;
  isFirstPeriodAfterTrial: boolean;
}): BillingPeriodTransition => {
  const boundary = invoicePeriodStart;

  const invoicedDurationMs = Math.max(
    0,
    invoicePeriodEnd.getTime() - invoicePeriodStart.getTime(),
  );

  const nextPeriodEnd =
    invoicePeriodEnd.getTime() > boundary.getTime()
      ? invoicePeriodEnd
      : subscriptionCurrentPeriodEnd;

  const closingPeriodStart = (() => {
    if (isFirstPeriodAfterTrial && isDefined(trialStart)) {
      return trialStart;
    }

    if (subscriptionCurrentPeriodStart.getTime() < boundary.getTime()) {
      return subscriptionCurrentPeriodStart;
    }

    return new Date(boundary.getTime() - invoicedDurationMs);
  })();

  return {
    closingPeriodStart,
    closingPeriodEnd: boundary,
    nextPeriodStart: boundary,
    nextPeriodEnd,
  };
};
