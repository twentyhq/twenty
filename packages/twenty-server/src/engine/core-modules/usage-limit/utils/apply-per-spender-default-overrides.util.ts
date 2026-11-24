import { isDefined } from 'twenty-shared/utils';

import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type QuotaLimitDefaultWithNullableValue } from 'src/engine/core-modules/usage-limit/types/quota-limit-default-with-nullable-value.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';

export const applyPerSpenderDefaultOverrides = ({
  quotaLimitDefaults,
  quotaLimits,
}: {
  quotaLimitDefaults: QuotaLimitDefaultWithNullableValue[];
  quotaLimits: FlatQuotaLimit[];
}): {
  quotaLimitDefaults: QuotaLimitDefault[];
  quotaLimits: FlatQuotaLimit[];
} => {
  const overrides = quotaLimitDefaults.map((quotaLimitDefault) => ({
    quotaLimitDefault,
    overridingLimit: quotaLimitDefault.isPerSpender
      ? quotaLimits.find((quotaLimit) =>
          doesUsageLimitRowSuppressDefault({
            scope: quotaLimit,
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
    quotaLimits: quotaLimits.filter(
      (quotaLimit) => !overridingLimitIds.has(quotaLimit.id),
    ),
  };
};
