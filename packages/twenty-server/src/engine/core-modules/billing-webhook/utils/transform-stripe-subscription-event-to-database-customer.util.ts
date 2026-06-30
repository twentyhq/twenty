/* @license Enterprise */

import type Stripe from 'stripe';

export const transformStripeSubscriptionEventToDatabaseCustomer = (
  workspaceId: string,
  data:
    | Stripe.CustomerSubscriptionUpdatedEvent.Data
    | Stripe.CustomerSubscriptionCreatedEvent.Data
    | Stripe.CustomerSubscriptionDeletedEvent.Data,
) => {
  return {
    workspaceId,
    stripeCustomerId: String(data.object.customer),
  };
};
