/* @license Enterprise */

import { subMonths, subYears } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

export type BillingPeriodTransition = {
  closingPeriodStart: Date;
  closingPeriodEnd: Date;
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
};

export const deriveBillingPeriodTransition = ({
  invoicePeriodStart,
  invoicePeriodEnd,
  subscriptionCurrentPeriodStart,
  subscriptionCurrentPeriodEnd,
  subscriptionInterval,
  trialStart,
  isFirstPeriodAfterTrial,
  subscriptionPreviousPeriodStart,
  ledgerPeriodStart,
}: {
  invoicePeriodStart: Date;
  invoicePeriodEnd: Date;
  subscriptionCurrentPeriodStart: Date;
  subscriptionCurrentPeriodEnd: Date;
  subscriptionInterval: SubscriptionInterval;
  trialStart: Date | null | undefined;
  isFirstPeriodAfterTrial: boolean;
  subscriptionPreviousPeriodStart: Date | null;
  ledgerPeriodStart: Date | null;
}): BillingPeriodTransition => {
  const boundary = invoicePeriodStart;

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

    if (
      isDefined(subscriptionPreviousPeriodStart) &&
      subscriptionPreviousPeriodStart.getTime() < boundary.getTime()
    ) {
      return subscriptionPreviousPeriodStart;
    }

    if (
      isDefined(ledgerPeriodStart) &&
      ledgerPeriodStart.getTime() < boundary.getTime()
    ) {
      return ledgerPeriodStart;
    }

    return subscriptionInterval === SubscriptionInterval.Year
      ? subYears(boundary, 1)
      : subMonths(boundary, 1);
  })();

  return {
    closingPeriodStart,
    closingPeriodEnd: boundary,
    nextPeriodStart: boundary,
    nextPeriodEnd,
  };
};
