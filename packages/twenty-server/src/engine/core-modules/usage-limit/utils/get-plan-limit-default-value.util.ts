import { isUndefined } from '@sniptt/guards';

import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { type PlanUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/types/plan-usage-limit-defaults.type';
import { type SubscriptionPlan } from 'src/engine/core-modules/usage-limit/types/subscription-plan.type';

export const getPlanLimitDefaultValue = ({
  usageLimitDefaultsByPlan,
  subscriptionPlan,
  limitValueConfigVariable,
  instanceValue,
}: {
  usageLimitDefaultsByPlan: Record<string, PlanUsageLimitDefaults>;
  subscriptionPlan: SubscriptionPlan;
  limitValueConfigVariable: OptionalNumericConfigVariableKey;
  instanceValue: number | null;
}): number | null => {
  const planUsageLimitDefaults =
    usageLimitDefaultsByPlan[subscriptionPlan.planKey];

  const values = subscriptionPlan.isTrialing
    ? {
        ...planUsageLimitDefaults?.values,
        ...planUsageLimitDefaults?.trialValues,
      }
    : planUsageLimitDefaults?.values;

  const planValue = values?.[limitValueConfigVariable];

  return isUndefined(planValue) ? instanceValue : planValue;
};
