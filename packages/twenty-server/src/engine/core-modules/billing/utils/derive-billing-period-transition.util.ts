/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { shiftUtcMonths } from 'src/engine/core-modules/billing/utils/shift-utc-months.util';

export type BillingPeriodTransition = {
  closingPeriodStart: Date;
  closingPeriodEnd: Date;
  nextPeriodStart: Date;
  isFirstPeriodAfterTrial: boolean;
};

// Stripe stamps the trial end and the boundary from the same schedule; the slack only absorbs rounding.
const TRIAL_END_TOLERANCE_IN_MS = 60 * 1000;

const subtractOneInterval = ({
  date,
  interval,
}: {
  date: Date;
  interval: SubscriptionInterval;
}): Date =>
  shiftUtcMonths({
    date,
    months: interval === SubscriptionInterval.Year ? -12 : -1,
  });

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
  subscriptionInterval: SubscriptionInterval | null | undefined;
  trialStart: Date | null | undefined;
  isFirstPeriodAfterTrial: boolean;
  subscriptionPreviousPeriodStart: Date | null;
  ledgerPeriodStart: Date | null;
}): Date => {
  if (isFirstPeriodAfterTrial && isDefined(trialStart)) {
    return trialStart;
  }

  // Stripe reports one window at a time; a subscription not yet advanced still holds the closing start.
  if (boundary.getTime() !== subscriptionCurrentPeriodStart.getTime()) {
    return subscriptionCurrentPeriodStart;
  }

  // Calendar arithmetic is wrong for month-end anchors (Jan 31 to Feb 28 comes back as Jan 28).
  if (
    isDefined(subscriptionPreviousPeriodStart) &&
    subscriptionPreviousPeriodStart.getTime() < boundary.getTime()
  ) {
    return subscriptionPreviousPeriodStart;
  }

  // Fallback for subscriptions that have not transitioned since subscriptionPreviousPeriodStart was added.
  if (
    isDefined(ledgerPeriodStart) &&
    ledgerPeriodStart.getTime() < boundary.getTime()
  ) {
    return ledgerPeriodStart;
  }

  // Assuming monthly would settle a yearly subscription against one month; throwing makes Stripe redeliver the webhook.
  if (!isDefined(subscriptionInterval)) {
    throw new BillingException(
      `Cannot settle the period closing at ${boundary.toISOString()}: the subscription records no interval and neither it nor the ledger says where the period began`,
      BillingExceptionCode.BILLING_SUBSCRIPTION_INVALID,
    );
  }

  // Calendar arithmetic, not the invoiced duration: a February renewal bills 28 days and would drop three days of usage.
  return subtractOneInterval({
    date: boundary,
    interval: subscriptionInterval,
  });
};

export const deriveBillingPeriodTransition = ({
  boundary,
  subscriptionCurrentPeriodStart,
  subscriptionInterval,
  trialStart,
  trialEnd,
  subscriptionPreviousPeriodStart,
  ledgerPeriodStart,
}: {
  boundary: Date;
  subscriptionCurrentPeriodStart: Date;
  subscriptionInterval: SubscriptionInterval | null | undefined;
  trialStart: Date | null | undefined;
  // Compare to the resolved boundary: an arrears-stamped invoice reports the window that just closed.
  trialEnd: Date | null | undefined;
  subscriptionPreviousPeriodStart: Date | null;
  ledgerPeriodStart: Date | null;
}): BillingPeriodTransition => {
  const isFirstPeriodAfterTrial =
    isDefined(trialEnd) &&
    Math.abs(boundary.getTime() - trialEnd.getTime()) <=
      TRIAL_END_TOLERANCE_IN_MS;

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
    isFirstPeriodAfterTrial,
  };
};
