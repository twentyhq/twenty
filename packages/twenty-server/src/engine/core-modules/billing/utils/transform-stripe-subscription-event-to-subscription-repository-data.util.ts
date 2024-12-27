import Stripe from 'stripe';

import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

export const transformStripeSubscriptionEventToSubscriptionRepositoryData = (
  workspaceId: string,
  data:
    | Stripe.CustomerSubscriptionUpdatedEvent.Data
    | Stripe.CustomerSubscriptionCreatedEvent.Data
    | Stripe.CustomerSubscriptionDeletedEvent.Data,
) => {
  return {
    workspaceId,
    stripeCustomerId: String(data.object.customer),
    stripeSubscriptionId: data.object.id,
    status: getSubscriptionStatus(data.object.status),
    interval: data.object.items.data[0].plan.interval,
    cancelAtPeriodEnd: data.object.cancel_at_period_end,
    currency: data.object.currency.toUpperCase(),
    currentPeriodEnd: getDateFromTimestamp(data.object.current_period_end),
    currentPeriodStart: getDateFromTimestamp(data.object.current_period_start),
    metadata: data.object.metadata,
    collectionMethod:
      BillingSubscriptionCollectionMethod[
        data.object.collection_method.toUpperCase()
      ],
    automaticTax:
      data.object.automatic_tax === null
        ? undefined
        : data.object.automatic_tax,
    cancellationDetails:
      data.object.cancellation_details === null
        ? undefined
        : data.object.cancellation_details,
    endedAt: data.object.ended_at
      ? getDateFromTimestamp(data.object.ended_at)
      : undefined,
    trialStart: data.object.trial_start
      ? getDateFromTimestamp(data.object.trial_start)
      : undefined,
    trialEnd: data.object.trial_end
      ? getDateFromTimestamp(data.object.trial_end)
      : undefined,
    cancelAt: data.object.cancel_at
      ? getDateFromTimestamp(data.object.cancel_at)
      : undefined,
    canceledAt: data.object.canceled_at
      ? getDateFromTimestamp(data.object.canceled_at)
      : undefined,
  };
};

const getSubscriptionStatus = (status: Stripe.Subscription.Status) => {
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
