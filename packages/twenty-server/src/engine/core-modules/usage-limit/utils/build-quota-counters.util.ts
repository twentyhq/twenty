import { isDefined } from 'twenty-shared/utils';

import { SPENDER_TYPE_SPECIFICITY } from 'src/engine/core-modules/usage-limit/constants/spender-type-specificity.constant';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { findLimitsForSpender } from 'src/engine/core-modules/usage-limit/utils/find-limits-for-spender.util';
import { computeQuotaLimitValue } from 'src/engine/core-modules/usage-limit/utils/compute-quota-limit-value.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsagePeriod } from 'src/engine/core-modules/usage/types/usage-period.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

const counterSpecificity = (counter: QuotaCounter): number =>
  SPENDER_TYPE_SPECIFICITY[counter.spenderType] * 4 +
  (isDefined(counter.spenderId) ? 0 : 2) +
  (counter.operationType === UsageOperationType.ALL ? 1 : 0);

export const buildQuotaCounters = ({
  limits,
  usageSpenders,
  workspaceId,
  resourceType,
  operationType,
  periodByUnit,
  allowanceMicro,
}: {
  limits: FlatUsageLimit[];
  usageSpenders: UsageSpenders;
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  periodByUnit: Partial<Record<PeriodUnit, UsagePeriod>>;
  allowanceMicro: number | null;
}): QuotaCounter[] => {
  const spenders = buildSpendersFromUsageSpenders(usageSpenders);

  const counters = spenders.flatMap((spender) =>
    findLimitsForSpender({ limits, spender, operationType }).flatMap(
      (limit) => {
        const limitValue = computeQuotaLimitValue({ limit, allowanceMicro });
        const period = periodByUnit[limit.periodUnit];

        if (!isDefined(limitValue) || !isDefined(period)) {
          return [];
        }

        return [
          {
            key: buildQuotaCounterKey({
              workspaceId,
              resourceType,
              operationType: limit.operationType,
              spenderType: limit.spenderType,
              spenderId: limit.spenderId,
              meter: limit.meter,
              periodUnit: limit.periodUnit,
              periodStart: period.periodStart,
            }),
            limitValue,
            meter: limit.meter,
            periodUnit: limit.periodUnit,
            periodStart: period.periodStart,
            periodEnd: period.periodEnd,
            spenderType: limit.spenderType,
            spenderId: limit.spenderId === '' ? null : limit.spenderId,
            operationType: limit.operationType,
          },
        ];
      },
    ),
  );

  return counters.sort((a, b) => counterSpecificity(a) - counterSpecificity(b));
};
