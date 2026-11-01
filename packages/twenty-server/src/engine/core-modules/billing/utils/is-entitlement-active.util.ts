/* @license Enterprise */

import { ENTITLEMENT_KEYS_GRANTED_WITHOUT_BILLING } from 'src/engine/core-modules/billing/constants/entitlement-keys-granted-without-billing.constant';
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
  isBillingEnabled
    ? hasValidEnterprisePlan && stripeEntitlementValue
    : hasValidEnterprisePlan ||
      ENTITLEMENT_KEYS_GRANTED_WITHOUT_BILLING.includes(key);
