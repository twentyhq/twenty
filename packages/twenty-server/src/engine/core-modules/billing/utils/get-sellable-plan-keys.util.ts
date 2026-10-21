/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlanSwitches } from 'src/engine/core-modules/billing/types/billing-plan-switches.type';

export const getSellablePlanKeys = (
  planSwitches: BillingPlanSwitches,
): BillingPlanKey[] => {
  const switchTargetPlanKeys = Object.values(planSwitches).flatMap(
    (planSwitch) => [
      ...(planSwitch?.upgradePlanKeys ?? []),
      ...(planSwitch?.downgradePlanKeys ?? []),
    ],
  );

  return Object.values(BillingPlanKey).filter((planKey) =>
    switchTargetPlanKeys.includes(planKey),
  );
};
