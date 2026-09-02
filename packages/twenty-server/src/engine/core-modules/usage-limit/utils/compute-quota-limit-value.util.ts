import { isDefined } from 'twenty-shared/utils';

import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';

const BASIS_POINTS_DENOMINATOR = 10_000;

export const computeQuotaLimitValue = ({
  limit,
  allowanceMicro,
}: {
  limit: FlatUsageLimit;
  allowanceMicro: number | null;
}): number | null => {
  if (limit.limitValueType === 'absolute') {
    return limit.limitValue;
  }

  if (!isDefined(allowanceMicro)) {
    return null;
  }

  return Math.floor(
    (allowanceMicro * limit.limitValue) / BASIS_POINTS_DENOMINATOR,
  );
};
