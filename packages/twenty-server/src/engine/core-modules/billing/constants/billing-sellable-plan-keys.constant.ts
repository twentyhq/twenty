/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

// Order is the display order, and the first key is the checkout default.
export const BILLING_SELLABLE_PLAN_KEYS: BillingPlanKey[] = [
  BillingPlanKey.PRO,
  BillingPlanKey.ENTERPRISE,
];
