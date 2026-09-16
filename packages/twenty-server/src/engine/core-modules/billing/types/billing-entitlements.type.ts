/* @license Enterprise */

import { type BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

export type BillingEntitlements = Partial<
  Record<BillingEntitlementKey, boolean>
>;
