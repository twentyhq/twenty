import { isDefined } from 'twenty-shared/utils';

import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';

const BASIS_POINTS_DENOMINATOR = 10_000;

export const resolveQuotaLimitValue = ({
  rule,
  allowanceMicro,
}: {
  rule: FlatUsageLimit;
  allowanceMicro: number | null;
}): number | null => {
  if (rule.limitValueType === 'absolute') {
    return rule.limitValue;
  }

  if (!isDefined(allowanceMicro)) {
    return null;
  }

  return Math.floor(
    (allowanceMicro * rule.limitValue) / BASIS_POINTS_DENOMINATOR,
  );
};
