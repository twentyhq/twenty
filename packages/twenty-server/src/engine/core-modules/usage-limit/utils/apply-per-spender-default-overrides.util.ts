import { isDefined } from 'twenty-shared/utils';

import { type ConfiguredQuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/configured-quota-limit-default.type';
import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';

export const applyPerSpenderDefaultOverrides = <TLimit extends FlatQuotaLimit>({
  quotaLimitDefaults,
  limits,
}: {
  quotaLimitDefaults: ConfiguredQuotaLimitDefault[];
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
    quotaLimitDefaults: overrides.flatMap(
      ({ quotaLimitDefault, overridingLimit }) => {
        const limitValue =
          overridingLimit?.limitValue ?? quotaLimitDefault.limitValue;

        return isDefined(limitValue)
          ? [{ ...quotaLimitDefault, limitValue }]
          : [];
      },
    ),
    limits: limits.filter((limit) => !overridingLimitIds.has(limit.id)),
  };
};
