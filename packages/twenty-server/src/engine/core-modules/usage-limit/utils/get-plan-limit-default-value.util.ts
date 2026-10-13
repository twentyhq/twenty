import { type PlanUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/types/plan-usage-limit-defaults.type';
import { type SubscriptionPlan } from 'src/engine/core-modules/usage-limit/types/subscription-plan.type';

export const getPlanLimitDefaultValue = ({
  usageLimitDefaultsByPlan,
  subscriptionPlan,
  limitValueConfigVariable,
}: {
  usageLimitDefaultsByPlan: Record<string, PlanUsageLimitDefaults>;
  subscriptionPlan: SubscriptionPlan;
  limitValueConfigVariable: string;
}): number | null | undefined => {
  const planUsageLimitDefaults =
    usageLimitDefaultsByPlan[subscriptionPlan.planKey];

  const values = subscriptionPlan.isTrialing
    ? {
        ...planUsageLimitDefaults?.values,
        ...planUsageLimitDefaults?.trialValues,
      }
    : planUsageLimitDefaults?.values;

  return values?.[limitValueConfigVariable];
};
