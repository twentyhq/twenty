/* @license Enterprise */

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import {
  type BillingPlanConfig,
  type BillingPlansConfig,
} from 'src/engine/core-modules/billing/types/billing-plans-config.type';

export const getBillingPlanConfig = ({
  plansConfig,
  planKey,
}: {
  plansConfig: BillingPlansConfig;
  planKey: BillingPlanKey;
}): BillingPlanConfig => ({
  isDefault: plansConfig[planKey]?.isDefault ?? false,
  upgradePlanKeys: plansConfig[planKey]?.upgradePlanKeys ?? [],
  downgradePlanKeys: plansConfig[planKey]?.downgradePlanKeys ?? [],
});
