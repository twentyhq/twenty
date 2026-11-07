/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlansConfig } from 'src/engine/core-modules/billing/types/billing-plans-config.type';

export const getSellablePlanKeys = (
  plansConfig: BillingPlansConfig,
): BillingPlanKey[] => {
  const switchTargetPlanKeys = Object.values(plansConfig).flatMap(
    (planConfig) => [
      ...(planConfig?.upgradePlanKeys ?? []),
      ...(planConfig?.downgradePlanKeys ?? []),
    ],
  );

  return Object.values(BillingPlanKey).filter((planKey) =>
    switchTargetPlanKeys.includes(planKey),
  );
};
