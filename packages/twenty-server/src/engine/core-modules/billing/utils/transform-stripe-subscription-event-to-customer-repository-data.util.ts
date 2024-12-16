import Stripe from 'stripe';

export const transformStripeSubscriptionEventToCustomerRepositoryData = (
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
