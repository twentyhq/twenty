/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlansConfig } from 'src/engine/core-modules/billing/types/billing-plans-config.type';
import { findDefaultPlanKey } from 'src/engine/core-modules/billing/utils/find-default-plan-key.util';
import { getBillingPlanConfig } from 'src/engine/core-modules/billing/utils/get-billing-plan-config.util';

export const getReverseTrialPlanKeys = (
  plansConfig: BillingPlansConfig,
):
  | { trialPlanKey: BillingPlanKey; downgradePlanKey: BillingPlanKey }
  | undefined => {
  const trialPlanKey = findDefaultPlanKey(plansConfig);

  if (!isDefined(trialPlanKey)) {
    return undefined;
  }

  const [downgradePlanKey] = getBillingPlanConfig({
    plansConfig,
    planKey: trialPlanKey,
  }).downgradePlanKeys;

  return isDefined(downgradePlanKey)
    ? { trialPlanKey, downgradePlanKey }
    : undefined;
};
