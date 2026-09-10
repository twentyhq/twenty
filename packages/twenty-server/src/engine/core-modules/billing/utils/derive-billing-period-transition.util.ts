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

// A subscription_cycle invoice is raised at the instant one period hands over
// to the next, and Stripe stamps it with the period it bills in advance. So its
// period_start is the transition instant: the closing period ends there and the
// new one starts there.
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
  // Where the subscription recorded the previous period starting, captured when
  // it advanced. Null for a subscription that has not transitioned since the
  // column was added.
  subscriptionPreviousPeriodStart: Date | null;
  // Where the ledger says the closing period started, used only when the
  // subscription has no record of it.
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

    // Recorded when the subscription advanced, so it is exact whatever the
    // anchor. Calendar arithmetic cannot reproduce it for month-end anchors: a
    // period running January 31 to February 28 comes back as starting January
    // 28, which widens the usage window into the period before and drags
    // already expired grants back into the carry-forward.
    if (
      isDefined(subscriptionPreviousPeriodStart) &&
      subscriptionPreviousPeriodStart.getTime() < boundary.getTime()
    ) {
      return subscriptionPreviousPeriodStart;
    }

    // Only until each subscription has transitioned once with the column in
    // place. The ledger records the boundary whenever the previous transition
    // closed a grant there, which is most workspaces but not all.
    if (
      isDefined(ledgerPeriodStart) &&
      ledgerPeriodStart.getTime() < boundary.getTime()
    ) {
      return ledgerPeriodStart;
    }

    // Calendar arithmetic, not the invoiced duration: consecutive periods
    // differ in length, so a February renewal bills 28 days and subtracting
    // those from February 1 would place the closing period at January 4 and
    // drop three days of usage, which then reads as unspent allowance.
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
