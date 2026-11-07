/* @license Enterprise */

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export type BillingPlanConfig = {
  isDefault: boolean;
  upgradePlanKeys: BillingPlanKey[];
  downgradePlanKeys: BillingPlanKey[];
};

export type BillingPlansConfig = Partial<
  Record<BillingPlanKey, Partial<BillingPlanConfig>>
>;
