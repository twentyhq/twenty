import { isDefined } from 'twenty-shared/utils';

import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';

// A row has no per-spender counters, so it lends its value to the default instead of replacing it
export const applyPerSpenderDefaultOverrides = <TLimit extends FlatQuotaLimit>({
  quotaLimitDefaults,
  limits,
}: {
  quotaLimitDefaults: QuotaLimitDefault[];
  limits: TLimit[];
}): { quotaLimitDefaults: QuotaLimitDefault[]; limits: TLimit[] } => {
  const overrides = quotaLimitDefaults.map((quotaLimitDefault) => ({
    quotaLimitDefault,
    overridingLimit: quotaLimitDefault.isPerSpender
      ? limits.find((limit) =>
          doesUsageLimitRowSuppressDefault({
            scope: limit,
            usageLimitDefault: quotaLimitDefault,
          }),
        )
      : undefined,
  }));

  const overridingLimitIds = new Set(
    overrides.flatMap(({ overridingLimit }) =>
      isDefined(overridingLimit) ? [overridingLimit.id] : [],
    ),
  );

  return {
    quotaLimitDefaults: overrides.map(
      ({ quotaLimitDefault, overridingLimit }) =>
        isDefined(overridingLimit)
          ? { ...quotaLimitDefault, limitValue: overridingLimit.limitValue }
          : quotaLimitDefault,
    ),
    limits: limits.filter((limit) => !overridingLimitIds.has(limit.id)),
  };
};
