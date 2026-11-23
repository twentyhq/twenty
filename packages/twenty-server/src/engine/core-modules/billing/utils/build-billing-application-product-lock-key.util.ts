/* @license Enterprise */

export const buildBillingApplicationProductLockKey = (
  stripeProductId: string,
): string => `billing-application-product:${stripeProductId}`;
