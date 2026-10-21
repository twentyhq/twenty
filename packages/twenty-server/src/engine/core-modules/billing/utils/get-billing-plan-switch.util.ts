/* @license Enterprise */

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import {
  type BillingPlanSwitch,
  type BillingPlanSwitches,
} from 'src/engine/core-modules/billing/types/billing-plan-switches.type';

export const getBillingPlanSwitch = ({
  planSwitches,
  planKey,
}: {
  planSwitches: BillingPlanSwitches;
  planKey: BillingPlanKey;
}): BillingPlanSwitch => ({
  upgradePlanKeys: planSwitches[planKey]?.upgradePlanKeys ?? [],
  downgradePlanKeys: planSwitches[planKey]?.downgradePlanKeys ?? [],
});
