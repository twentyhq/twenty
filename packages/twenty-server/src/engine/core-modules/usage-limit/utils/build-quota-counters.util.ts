import { isDefined } from 'twenty-shared/utils';

import { SPENDER_TYPE_SPECIFICITY } from 'src/engine/core-modules/usage-limit/constants/spender-type-specificity.constant';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { buildLimitQuotaCounter } from 'src/engine/core-modules/usage-limit/utils/build-limit-quota-counter.util';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { findLimitsForSpender } from 'src/engine/core-modules/usage-limit/utils/find-limits-for-spender.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

const counterSpecificity = (counter: LimitQuotaCounter): number =>
  SPENDER_TYPE_SPECIFICITY[counter.spenderType] * 4 +
  (isDefined(counter.spenderId) ? 0 : 2) +
  (counter.operationType === UsageOperationType.ALL ? 1 : 0);

export const buildQuotaCounters = ({
  limits,
  usageSpenders,
  workspaceId,
  operationType,
  periodByUnit,
}: {
  limits: FlatUsageLimit[];
  usageSpenders: UsageSpenders;
  workspaceId: string;
  operationType: UsageOperationType;
  periodByUnit: Partial<Record<PeriodUnit, UsagePeriod>>;
}): LimitQuotaCounter[] => {
  const spenders = buildSpendersFromUsageSpenders(usageSpenders);

  const counters = spenders.flatMap((spender) =>
    findLimitsForSpender({ limits, spender, operationType }).flatMap(
      (limit) => {
        const period = periodByUnit[limit.periodUnit];

        if (!isDefined(period)) {
          return [];
        }

        return [buildLimitQuotaCounter({ workspaceId, limit, period })];
      },
    ),
  );

  return counters.sort((a, b) => counterSpecificity(a) - counterSpecificity(b));
};
