import { isDefined } from 'twenty-shared/utils';

import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaConsumptionRow } from 'src/engine/core-modules/usage-limit/types/quota-consumption-row.type';
import { buildPeriodGroupKey } from 'src/engine/core-modules/usage-limit/utils/build-period-group-key.util';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';

export const buildLimitWarmedEntries = ({
  coldLimitCounters,
  rowsByPeriod,
  now,
}: {
  coldLimitCounters: LimitQuotaCounter[];
  rowsByPeriod: Map<string, QuotaConsumptionRow[]>;
  now: number;
}): { key: string; value: number; ttl: number }[] =>
  coldLimitCounters.flatMap((counter) => {
    const ttl = counter.periodEnd.getTime() - now;
    const rows = rowsByPeriod.get(buildPeriodGroupKey(counter));

    if (ttl <= 0 || !isDefined(rows)) {
      return [];
    }

    return [
      {
        key: counter.key,
        value: counter.limitValue - computeQuotaConsumed({ rows, counter }),
        ttl,
      },
    ];
  });
