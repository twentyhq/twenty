import { isDefined } from 'twenty-shared/utils';

import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { buildLimitQuotaCounter } from 'src/engine/core-modules/usage-limit/utils/build-limit-quota-counter.util';
import { isQuotaLimit } from 'src/engine/core-modules/usage-limit/utils/is-quota-limit.util';

export const buildStaleUpdatedLimitCounterKeys = ({
  workspaceId,
  previousUsageLimit,
  updatedUsageLimit,
  isPreviousUsageLimitEnforced,
  periodByUnit,
}: {
  workspaceId: string;
  previousUsageLimit: FlatUsageLimit;
  updatedUsageLimit: FlatUsageLimit;
  isPreviousUsageLimitEnforced: boolean;
  periodByUnit: Partial<Record<PeriodUnit, UsagePeriod>>;
}): string[] => {
  if (!isQuotaLimit(updatedUsageLimit)) {
    return [];
  }

  const updatedPeriod = periodByUnit[updatedUsageLimit.periodUnit];

  if (!isDefined(updatedPeriod)) {
    return [];
  }

  const updatedKey = buildLimitQuotaCounter({
    workspaceId,
    limit: updatedUsageLimit,
    period: updatedPeriod,
  }).key;

  const previousPeriod = periodByUnit[previousUsageLimit.periodUnit];

  const previousKey =
    isQuotaLimit(previousUsageLimit) && isDefined(previousPeriod)
      ? buildLimitQuotaCounter({
          workspaceId,
          limit: previousUsageLimit,
          period: previousPeriod,
        }).key
      : null;

  return isPreviousUsageLimitEnforced && previousKey === updatedKey
    ? []
    : [updatedKey];
};
