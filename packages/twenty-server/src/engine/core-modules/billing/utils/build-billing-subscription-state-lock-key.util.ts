/* @license Enterprise */

export const buildBillingSubscriptionStateLockKey = (
  stripeCustomerId: string,
): string => `billing-subscription-state:${stripeCustomerId}`;
