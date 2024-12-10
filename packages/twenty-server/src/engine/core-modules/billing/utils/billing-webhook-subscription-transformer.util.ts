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
    stripeCustomerId: data.object.customer as string,
    stripeSubscriptionId: data.object.id,
    status: data.object.status as SubscriptionStatus,
    interval: data.object.items.data[0].plan.interval,
    cancelAtPeriodEnd: data.object.cancel_at_period_end,
    currency: data.object.currency.toUpperCase(),
    currentPeriodEnd: new Date(data.object.current_period_end * 1000),
    currentPeriodStart: new Date(data.object.current_period_start * 1000),
    metadata: data.object.metadata,
    collectionMethod:
      data.object.collection_method.toUpperCase() as BillingSubscriptionCollectionMethod,
    automaticTax: data.object.automatic_tax ?? undefined,
    cancellationDetails: data.object.cancellation_details ?? undefined,
    endedAt: data.object.ended_at
      ? new Date(data.object.ended_at * 1000)
      : undefined,
    trialStart: data.object.trial_start
      ? new Date(data.object.trial_start * 1000)
      : undefined,
    trialEnd: data.object.trial_end
      ? new Date(data.object.trial_end * 1000)
      : undefined,
    cancelAt: data.object.cancel_at
      ? new Date(data.object.cancel_at * 1000)
      : undefined,
    canceledAt: data.object.canceled_at
      ? new Date(data.object.canceled_at * 1000)
      : undefined,
  };
};

export const transformStripeSubscriptionEventToSubscriptionItemRepositoryData =
  (
    billingSubscriptionId: string,
    data:
      | Stripe.CustomerSubscriptionUpdatedEvent.Data
      | Stripe.CustomerSubscriptionCreatedEvent.Data
      | Stripe.CustomerSubscriptionDeletedEvent.Data,
  ) => {
    return data.object.items.data.map((item) => {
      return {
        billingSubscriptionId,
        stripeSubscriptionId: data.object.id,
        stripeProductId: item.price.product as string,
        stripePriceId: item.price.id,
        stripeSubscriptionItemId: item.id,
        quantity: item.quantity,
        metadata: item.metadata,
        billingThresholds: item.billing_thresholds ?? undefined,
      };
    });
  };

export const transformStripeSubscriptionEventToCustomerRepositoryData = (
  workspaceId: string,
  data:
    | Stripe.CustomerSubscriptionUpdatedEvent.Data
    | Stripe.CustomerSubscriptionCreatedEvent.Data
    | Stripe.CustomerSubscriptionDeletedEvent.Data,
) => {
  return {
    workspaceId,
    stripeCustomerId: data.object.customer as string,
  };
};
