/* @license Enterprise */

import type Stripe from 'stripe';

import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { type SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';
import {
  transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase
} from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-schedule-event-to-database-subscription-phase.util';

export const transformStripeSubscriptionEventToDatabaseSubscription = (
  workspaceId: string,
  subscription: SubscriptionWithSchedule,
) => {
  return {
    workspaceId,
    stripeCustomerId: String(subscription.customer),
    stripeSubscriptionId: subscription.id,
    status: getSubscriptionStatus(subscription.status),
    interval: subscription.items.data[0].plan.interval as SubscriptionInterval,
    phases: transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase(
      subscription.schedule,
    ),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currency: subscription.currency.toUpperCase(),
    currentPeriodEnd: getDateFromTimestamp(subscription.current_period_end),
    currentPeriodStart: getDateFromTimestamp(subscription.current_period_start),
    metadata: subscription.metadata,
    collectionMethod:
      // @ts-expect-error legacy noImplicitAny
      BillingSubscriptionCollectionMethod[
        subscription.collection_method.toUpperCase()
      ],
    automaticTax:
      subscription.automatic_tax === null
        ? undefined
        : subscription.automatic_tax,
    cancellationDetails:
      subscription.cancellation_details === null
        ? undefined
        : subscription.cancellation_details,
    endedAt: subscription.ended_at
      ? getDateFromTimestamp(subscription.ended_at)
      : undefined,
    trialStart: subscription.trial_start
      ? getDateFromTimestamp(subscription.trial_start)
      : undefined,
    trialEnd: subscription.trial_end
      ? getDateFromTimestamp(subscription.trial_end)
      : undefined,
    cancelAt: subscription.cancel_at
      ? getDateFromTimestamp(subscription.cancel_at)
      : undefined,
    canceledAt: subscription.canceled_at
      ? getDateFromTimestamp(subscription.canceled_at)
      : undefined,
  };
};

export const getSubscriptionStatus = (status: Stripe.Subscription.Status) => {
  switch (status) {
    case 'active':
      return SubscriptionStatus.Active;
    case 'canceled':
      return SubscriptionStatus.Canceled;
    case 'incomplete':
      return SubscriptionStatus.Incomplete;
    case 'incomplete_expired':
      return SubscriptionStatus.IncompleteExpired;
    case 'past_due':
      return SubscriptionStatus.PastDue;
    case 'paused':
      return SubscriptionStatus.Paused;
    case 'trialing':
      return SubscriptionStatus.Trialing;
    case 'unpaid':
      return SubscriptionStatus.Unpaid;
  }
};

const getDateFromTimestamp = (timestamp: number) => {
  return new Date(timestamp * 1000);
};
