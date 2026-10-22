/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type BillingPlansConfig } from 'src/engine/core-modules/billing/types/billing-plans-config.type';
import { getReverseTrialPlanKeys } from 'src/engine/core-modules/billing/utils/get-reverse-trial-plan-keys.util';

export const isReverseTrialDowngrade = ({
  plansConfig,
  currentPlanKey,
  targetPlanKey,
}: {
  plansConfig: BillingPlansConfig;
  currentPlanKey: BillingPlanKey;
  targetPlanKey: BillingPlanKey;
}): boolean => {
  const reverseTrialPlanKeys = getReverseTrialPlanKeys(plansConfig);

  return (
    isDefined(reverseTrialPlanKeys) &&
    reverseTrialPlanKeys.trialPlanKey === currentPlanKey &&
    reverseTrialPlanKeys.downgradePlanKey === targetPlanKey
  );
};
