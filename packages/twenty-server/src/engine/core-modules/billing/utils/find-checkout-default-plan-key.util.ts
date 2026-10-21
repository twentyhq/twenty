/* @license Enterprise */

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlanSwitches } from 'src/engine/core-modules/billing/types/billing-plan-switches.type';
import { getBillingPlanSwitch } from 'src/engine/core-modules/billing/utils/get-billing-plan-switch.util';
import { getSellablePlanKeys } from 'src/engine/core-modules/billing/utils/get-sellable-plan-keys.util';

export const findCheckoutDefaultPlanKey = (
  planSwitches: BillingPlanSwitches,
): BillingPlanKey | undefined => {
  const entryPlanKeys = getSellablePlanKeys(planSwitches).filter(
    (planKey) =>
      getBillingPlanSwitch({ planSwitches, planKey }).downgradePlanKeys
        .length === 0,
  );

  return entryPlanKeys.length === 1 ? entryPlanKeys[0] : undefined;
};
