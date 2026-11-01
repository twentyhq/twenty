import { isDefined } from 'twenty-shared/utils';

import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { buildLimitQuotaCounter } from 'src/engine/core-modules/usage-limit/utils/build-limit-quota-counter.util';
import { findEnforceableLimits } from 'src/engine/core-modules/usage-limit/utils/find-enforceable-limits.util';
import { isQuotaLimit } from 'src/engine/core-modules/usage-limit/utils/is-quota-limit.util';

export const buildIntraWorkspaceLimitCounterKeys = ({
  workspaceId,
  limits,
  periodByUnit,
}: {
  workspaceId: string;
  limits: FlatUsageLimit[];
  periodByUnit: Partial<Record<PeriodUnit, UsagePeriod>>;
}): string[] => {
  const quotaLimits = limits.filter(isQuotaLimit);

  const limitIdsEnforcedWithoutEntitlement = new Set(
    findEnforceableLimits({
      limits: quotaLimits,
      isIntraWorkspaceLimitEntitled: false,
    }).map((limit) => limit.id),
  );

  return quotaLimits
    .filter((limit) => !limitIdsEnforcedWithoutEntitlement.has(limit.id))
    .flatMap((limit) => {
      const period = periodByUnit[limit.periodUnit];

      return isDefined(period)
        ? [buildLimitQuotaCounter({ workspaceId, limit, period }).key]
        : [];
    });
};
