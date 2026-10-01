/* @license Enterprise */

import type Stripe from 'stripe';

// Stripe SDK v19 moved the subscription from `Invoice.subscription` to
// `Invoice.parent.subscription_details.subscription`; invoices created before
// the migration still carry the old field.
export const getSubscriptionIdFromInvoice = (
  invoice: Stripe.Invoice,
): string | undefined => {
  // New structure (Stripe SDK v19+)
  const subscriptionFromParent = invoice.parent?.subscription_details
    ?.subscription as string | Stripe.Subscription | null | undefined;

  if (subscriptionFromParent) {
    return typeof subscriptionFromParent === 'string'
      ? subscriptionFromParent
      : subscriptionFromParent.id;
  }

  // Legacy structure (pre-v19 invoices may still have this field at runtime)
  // The field exists in the API response but was removed from SDK types in v19
  const legacySubscription = (
    invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription }
  ).subscription;

  if (legacySubscription) {
    return typeof legacySubscription === 'string'
      ? legacySubscription
      : legacySubscription.id;
  }

  return undefined;
};
