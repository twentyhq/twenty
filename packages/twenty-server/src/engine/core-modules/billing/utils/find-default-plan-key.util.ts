/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlansConfig } from 'src/engine/core-modules/billing/types/billing-plans-config.type';
import { getBillingPlanConfig } from 'src/engine/core-modules/billing/utils/get-billing-plan-config.util';

export const findDefaultPlanKey = (
  plansConfig: BillingPlansConfig,
): BillingPlanKey | undefined => {
  const defaultPlanKeys = Object.values(BillingPlanKey).filter(
    (planKey) => getBillingPlanConfig({ plansConfig, planKey }).isDefault,
  );

  return defaultPlanKeys.length === 1 ? defaultPlanKeys[0] : undefined;
};
