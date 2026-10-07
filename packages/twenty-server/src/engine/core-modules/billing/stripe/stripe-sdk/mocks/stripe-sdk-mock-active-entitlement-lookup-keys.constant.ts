/* @license Enterprise */

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

// Every key, so a suite that falls back to the full list never revokes what another suite granted
export const STRIPE_SDK_MOCK_ACTIVE_ENTITLEMENT_LOOKUP_KEYS: string[] =
  Object.values(BillingEntitlementKey);
