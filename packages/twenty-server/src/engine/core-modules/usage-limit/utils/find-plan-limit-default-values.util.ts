import { isPlainObject } from 'twenty-shared/utils';

import { type PlanLimitDefaultValuesByConfigVariable } from 'src/engine/core-modules/usage-limit/types/plan-limit-default-values-by-config-variable.type';
import { type SubscriptionPlan } from 'src/engine/core-modules/usage-limit/types/subscription-plan.type';
import { findPlanSectionLimitDefaultValues } from 'src/engine/core-modules/usage-limit/utils/find-plan-section-limit-default-values.util';

export const findPlanLimitDefaultValues = ({
  plans,
  subscriptionPlan,
}: {
  plans: Record<string, unknown>;
  subscriptionPlan: SubscriptionPlan;
}): PlanLimitDefaultValuesByConfigVariable => {
  const plan = plans[subscriptionPlan.planKey];

  if (!isPlainObject(plan)) {
    return new Map();
  }

  return new Map(
    [
      ...findPlanSectionLimitDefaultValues(plan.values),
      ...(subscriptionPlan.isTrialing
        ? findPlanSectionLimitDefaultValues(plan.trialValues)
        : []),
    ].map(({ configVariable, limitValue }) => [configVariable, limitValue]),
  );
};
