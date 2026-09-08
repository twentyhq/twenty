/* @license Enterprise */

import { subMonths, subYears } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

export type BillingPeriodTransition = {
  closingPeriodStart: Date;
  closingPeriodEnd: Date;
  nextPeriodStart: Date;
};

const subtractOneInterval = (
  date: Date,
  interval: SubscriptionInterval,
): Date =>
  interval === SubscriptionInterval.Year
    ? subYears(date, 1)
    : subMonths(date, 1);

// The invoice is raised at the handover, so its period_end can be either side
// of it depending on clock skew between Stripe and us.
const BOUNDARY_ARRIVAL_TOLERANCE_IN_MS = 60 * 60 * 1000;

// Stripe stamps a subscription_cycle invoice with the period it bills, which is
// the upcoming one for licensed items but the one that just closed for metered
// items. Resource credits are sold as a metered item, so on a subscription
// carrying both the invoice can arrive stamped with either window and its
// period_start is not the handover instant. The subscription is unambiguous
// about where its own periods hand over, so the boundary is read off it: the
// invoice only tells us that a handover happened.
//
// Of the subscription's two boundaries, the one being announced is the latest
// that has actually arrived. Taking the nearest instead would let a redelivery
// hours or days late pick the period end still in the future and settle a
// period that has not closed, on partial usage, and reserve the idempotency
// key that the real transition then needs.
export const resolveBillingTransitionBoundary = ({
  observedAt,
  subscriptionCurrentPeriodStart,
  subscriptionCurrentPeriodEnd,
}: {
  observedAt: Date;
  subscriptionCurrentPeriodStart: Date;
  subscriptionCurrentPeriodEnd: Date;
}): Date => {
  const arrivedBy = observedAt.getTime() + BOUNDARY_ARRIVAL_TOLERANCE_IN_MS;

  if (subscriptionCurrentPeriodEnd.getTime() <= arrivedBy) {
    return subscriptionCurrentPeriodEnd;
  }

  return subscriptionCurrentPeriodStart;
};

const resolveClosingPeriodStart = ({
  boundary,
  subscriptionCurrentPeriodStart,
  subscriptionInterval,
  trialStart,
  isFirstPeriodAfterTrial,
  subscriptionPreviousPeriodStart,
  ledgerPeriodStart,
}: {
  boundary: Date;
  subscriptionCurrentPeriodStart: Date;
  subscriptionInterval: SubscriptionInterval;
  trialStart: Date | null | undefined;
  isFirstPeriodAfterTrial: boolean;
  subscriptionPreviousPeriodStart: Date | null;
  ledgerPeriodStart: Date | null;
}): Date => {
  if (isFirstPeriodAfterTrial && isDefined(trialStart)) {
    return trialStart;
  }

  // Stripe reports one window at a time, so at the instant a cycle invoice is
  // raised the subscription either still holds the period that is closing or
  // has already been moved on to the next one. In the first case it still
  // carries the closing period's exact start and nothing has to be
  // reconstructed.
  if (boundary.getTime() !== subscriptionCurrentPeriodStart.getTime()) {
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
  return subtractOneInterval(boundary, subscriptionInterval);
};

export const deriveBillingPeriodTransition = ({
  boundary,
  subscriptionCurrentPeriodStart,
  subscriptionInterval,
  trialStart,
  isFirstPeriodAfterTrial,
  subscriptionPreviousPeriodStart,
  ledgerPeriodStart,
}: {
  // Resolved through resolveBillingTransitionBoundary before the ledger is
  // read, since which period start the ledger is asked for depends on it.
  boundary: Date;
  subscriptionCurrentPeriodStart: Date;
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
  const closingPeriodStart = resolveClosingPeriodStart({
    boundary,
    subscriptionCurrentPeriodStart,
    subscriptionInterval,
    trialStart,
    isFirstPeriodAfterTrial,
    subscriptionPreviousPeriodStart,
    ledgerPeriodStart,
  });

  return {
    closingPeriodStart,
    closingPeriodEnd: boundary,
    nextPeriodStart: boundary,
  };
};
