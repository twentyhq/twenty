/* @license Enterprise */

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

// Usage waivers only mean something where Stripe bills, so neither billing-off nor the license grants them
export const STRIPE_ONLY_ENTITLEMENT_KEYS: BillingEntitlementKey[] = [
  BillingEntitlementKey.INCLUDED_FAST_MODEL,
];
