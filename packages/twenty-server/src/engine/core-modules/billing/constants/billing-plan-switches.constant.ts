/* @license Enterprise */

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlanSwitches } from 'src/engine/core-modules/billing/types/billing-plan-switches.type';

export const BILLING_PLAN_SWITCHES: BillingPlanSwitches = {
  [BillingPlanKey.PRO]: {
    upgradePlanKeys: [BillingPlanKey.ENTERPRISE],
    downgradePlanKeys: [],
  },
  [BillingPlanKey.ENTERPRISE]: {
    upgradePlanKeys: [],
    downgradePlanKeys: [BillingPlanKey.PRO],
  },
  [BillingPlanKey.PRO_V2]: {
    upgradePlanKeys: [],
    downgradePlanKeys: [],
  },
  [BillingPlanKey.ORGANIZATION_V2]: {
    upgradePlanKeys: [],
    downgradePlanKeys: [],
  },
};
