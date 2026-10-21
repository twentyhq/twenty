/* @license Enterprise */

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export type BillingPlanSwitch = {
  upgradePlanKeys: BillingPlanKey[];
  downgradePlanKeys: BillingPlanKey[];
};

export type BillingPlanSwitches = Partial<
  Record<BillingPlanKey, Partial<BillingPlanSwitch>>
>;
