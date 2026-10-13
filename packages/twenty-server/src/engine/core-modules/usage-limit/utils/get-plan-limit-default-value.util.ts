import { isUndefined } from '@sniptt/guards';

import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { type PlanUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/types/plan-usage-limit-defaults.type';

export const getPlanLimitDefaultValue = ({
  usageLimitDefaultsByPlan,
  planKey,
  limitValueConfigVariable,
  instanceValue,
}: {
  usageLimitDefaultsByPlan: Record<string, PlanUsageLimitDefaults>;
  planKey: string;
  limitValueConfigVariable: OptionalNumericConfigVariableKey;
  instanceValue: number | null;
}): number | null => {
  const planValue =
    usageLimitDefaultsByPlan[planKey]?.[limitValueConfigVariable];

  return isUndefined(planValue) ? instanceValue : planValue;
};
