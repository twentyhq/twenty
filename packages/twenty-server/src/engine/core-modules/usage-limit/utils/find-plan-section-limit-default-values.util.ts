import { isPlainObject } from 'twenty-shared/utils';

import { type PlanLimitDefaultValue } from 'src/engine/core-modules/usage-limit/types/plan-limit-default-value.type';
import { isPlanLimitDefaultValue } from 'src/engine/core-modules/usage-limit/utils/is-plan-limit-default-value.util';
import { isQuotaOrStockDefaultConfigVariable } from 'src/engine/core-modules/usage-limit/utils/is-quota-or-stock-default-config-variable.util';

export const findPlanSectionLimitDefaultValues = (
  section: unknown,
): PlanLimitDefaultValue[] => {
  if (!isPlainObject(section)) {
    return [];
  }

  return Object.entries(section).flatMap(([configVariable, limitValue]) =>
    isQuotaOrStockDefaultConfigVariable(configVariable) &&
    isPlanLimitDefaultValue(limitValue)
      ? [{ configVariable, limitValue }]
      : [],
  );
};
