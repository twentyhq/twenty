import { isDefined } from 'twenty-shared/utils';

import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';

const BASIS_POINTS_DENOMINATOR = 10_000;

// Percent rules are expressed in basis points of the workspace allowance.
// Without an allowance to take a share of, a percent rule cannot bind, so it
// resolves to null and the caller drops the counter.
export const resolveQuotaLimitValue = ({
  rule,
  allowance,
}: {
  rule: FlatUsageLimit;
  allowance: number | null;
}): number | null => {
  if (rule.limitValueType === 'absolute') {
    return rule.limitValue;
  }

  if (!isDefined(allowance)) {
    return null;
  }

  return Math.floor((allowance * rule.limitValue) / BASIS_POINTS_DENOMINATOR);
};
