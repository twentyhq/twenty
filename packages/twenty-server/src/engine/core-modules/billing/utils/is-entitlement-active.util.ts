/* @license Enterprise */

import { STRIPE_ONLY_ENTITLEMENT_KEYS } from 'src/engine/core-modules/billing/constants/stripe-only-entitlement-keys.constant';
import { type BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

export const isEntitlementActive = ({
  key,
  hasValidEnterprisePlan,
  isBillingEnabled,
  stripeEntitlementValue,
}: {
  key: BillingEntitlementKey;
  hasValidEnterprisePlan: boolean;
  isBillingEnabled: boolean;
  stripeEntitlementValue: boolean;
}): boolean =>
  STRIPE_ONLY_ENTITLEMENT_KEYS.includes(key)
    ? isBillingEnabled && stripeEntitlementValue
    : hasValidEnterprisePlan && (!isBillingEnabled || stripeEntitlementValue);
