/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

// The plan comparison shows exactly two plans; the first one is the checkout default.
export const BILLING_SELLABLE_PLAN_KEYS: [BillingPlanKey, BillingPlanKey] = [
  BillingPlanKey.PRO,
  BillingPlanKey.ENTERPRISE,
];
