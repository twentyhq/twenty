/* @license Enterprise */

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export type BillingPlanSwitches = Record<
  BillingPlanKey,
  { upgradePlanKeys: BillingPlanKey[]; downgradePlanKeys: BillingPlanKey[] }
>;
