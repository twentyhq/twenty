/* @license Enterprise */

import type Stripe from 'stripe';

import { transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-schedule-event-to-database-subscription-phase.util';
import {
  type AutomaticTaxJson,
  type CancellationDetailsJson,
} from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { type SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';

// Converts Stripe AutomaticTax to serialized JSON for JSONB storage
// Normalizes expandable fields (e.g., liability.account) to string IDs
const toAutomaticTaxJson = (
  value: Stripe.Subscription.AutomaticTax | null | undefined,
): AutomaticTaxJson | undefined => {
  if (!value) {
    return undefined;
  }

  return {
    disabled_reason: value.disabled_reason,
    enabled: value.enabled,
    liability: value.liability
      ? {
          type: value.liability.type,
          account:
            typeof value.liability.account === 'string'
              ? value.liability.account
              : value.liability.account?.id,
        }
      : null,
  };
};

// Converts Stripe CancellationDetails to serialized JSON for JSONB storage
const toCancellationDetailsJson = (
  value: Stripe.Subscription.CancellationDetails | null | undefined,
): CancellationDetailsJson | undefined => {
  if (!value) {
    return undefined;
  }

  return {
    comment: value.comment,
    feedback: value.feedback,
    reason: value.reason,
  };
};

export const transformStripeSubscriptionEventToDatabaseSubscription = (
  workspaceId: string,
  subscription: SubscriptionWithSchedule,
) => {
  // In Stripe SDK v19+, current_period_start/end moved from Subscription to SubscriptionItem
  const firstItem = subscription.items.data[0];

  return {
    workspaceId,
    stripeCustomerId: String(subscription.customer),
    stripeSubscriptionId: subscription.id,
    status: getSubscriptionStatus(subscription.status),
    interval: firstItem.plan.interval as SubscriptionInterval,
    phases: subscription.schedule
      ? transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase(
          subscription.schedule,
        )
      : [],
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currency: subscription.currency.toUpperCase(),
    currentPeriodEnd: getDateFromTimestamp(firstItem.current_period_end),
    currentPeriodStart: getDateFromTimestamp(firstItem.current_period_start),
    metadata: subscription.metadata,
    collectionMethod:
      // @ts-expect-error legacy noImplicitAny
      BillingSubscriptionCollectionMethod[
        subscription.collection_method.toUpperCase()
      ],
    automaticTax: toAutomaticTaxJson(subscription.automatic_tax),
    cancellationDetails: toCancellationDetailsJson(
      subscription.cancellation_details,
    ),
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
