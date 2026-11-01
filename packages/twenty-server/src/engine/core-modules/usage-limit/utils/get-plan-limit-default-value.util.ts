import { isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { TRIAL_USAGE_LIMIT_DEFAULTS_KEY } from 'src/engine/core-modules/usage-limit/constants/trial-usage-limit-defaults-key.constant';
import { type PlanUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/types/plan-usage-limit-defaults.type';

export const getPlanLimitDefaultValue = ({
  usageLimitDefaultsByPlan,
  planKey,
  isTrialing,
  limitValueConfigVariable,
  instanceValue,
}: {
  usageLimitDefaultsByPlan: Record<string, PlanUsageLimitDefaults>;
  planKey: string | null;
  isTrialing: boolean;
  limitValueConfigVariable: OptionalNumericConfigVariableKey;
  instanceValue: number | null;
}): number | null => {
  const trialValue = isTrialing
    ? usageLimitDefaultsByPlan[TRIAL_USAGE_LIMIT_DEFAULTS_KEY]?.[
        limitValueConfigVariable
      ]
    : undefined;

  if (!isUndefined(trialValue)) {
    return trialValue;
  }

  const planValue = isDefined(planKey)
    ? usageLimitDefaultsByPlan[planKey]?.[limitValueConfigVariable]
    : undefined;

  return isUndefined(planValue) ? instanceValue : planValue;
};
