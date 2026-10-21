/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlansConfig } from 'src/engine/core-modules/billing/types/billing-plans-config.type';

export const findDefaultPlanKey = (
  plansConfig: BillingPlansConfig,
): BillingPlanKey | undefined => {
  const defaultPlanKeys = Object.values(BillingPlanKey).filter(
    (planKey) => plansConfig[planKey]?.isDefault === true,
  );

  return defaultPlanKeys.length === 1 ? defaultPlanKeys[0] : undefined;
};
