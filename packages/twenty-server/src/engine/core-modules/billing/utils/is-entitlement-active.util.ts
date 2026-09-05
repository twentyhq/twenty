/* @license Enterprise */

export const isEntitlementActive = ({
  hasValidEnterprisePlan,
  isBillingEnabled,
  stripeEntitlementValue,
}: {
  hasValidEnterprisePlan: boolean;
  isBillingEnabled: boolean;
  stripeEntitlementValue: boolean;
}): boolean =>
  hasValidEnterprisePlan && (!isBillingEnabled || stripeEntitlementValue);
