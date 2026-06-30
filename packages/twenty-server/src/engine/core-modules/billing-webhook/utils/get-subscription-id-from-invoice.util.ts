/* @license Enterprise */

import type Stripe from 'stripe';

/**
 * Extracts the subscription ID from a Stripe invoice.
 *
 * In Stripe SDK v19+, the subscription field moved from `Invoice.subscription`
 * to `Invoice.parent.subscription_details.subscription`.
 *
 * This utility handles both structures for backward compatibility with invoices
 * created before the SDK migration.
 */
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
