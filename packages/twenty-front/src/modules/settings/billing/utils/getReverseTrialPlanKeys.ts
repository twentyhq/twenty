import { isDefined } from 'twenty-shared/utils';
import {
  type BillingPlan,
  type BillingPlanKey,
} from '~/generated-metadata/graphql';

export const getReverseTrialPlanKeys = (
  plans: Pick<
    BillingPlan,
    'downgradePlanKeys' | 'isCheckoutDefault' | 'planKey'
  >[],
):
  | { trialPlanKey: BillingPlanKey; downgradePlanKey: BillingPlanKey }
  | undefined => {
  const trialPlan = plans.find((plan) => plan.isCheckoutDefault);

  if (!isDefined(trialPlan)) {
    return undefined;
  }

  const [downgradePlanKey] = trialPlan.downgradePlanKeys;

  if (
    trialPlan.downgradePlanKeys.length !== 1 ||
    downgradePlanKey === trialPlan.planKey
  ) {
    return undefined;
  }

  return { trialPlanKey: trialPlan.planKey, downgradePlanKey };
};
