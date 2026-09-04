import { isDefined } from 'twenty-shared/utils';

import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaConsumptionRow } from 'src/engine/core-modules/usage-limit/types/quota-consumption-row.type';
import { buildPeriodGroupKey } from 'src/engine/core-modules/usage-limit/utils/build-period-group-key.util';
import { computeCounterBudget } from 'src/engine/core-modules/usage-limit/utils/compute-counter-budget.util';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';

export const buildLimitWarmedEntries = ({
  coldLimitCounters,
  rowsByPeriod,
  allowance,
  now,
}: {
  coldLimitCounters: LimitQuotaCounter[];
  rowsByPeriod: Map<string, QuotaConsumptionRow[]>;
  allowance: CreditAllowance | null;
  now: number;
}): { key: string; value: number; ttl: number }[] =>
  coldLimitCounters.flatMap((counter) => {
    const ttl = counter.periodEnd.getTime() - now;
    const rows = rowsByPeriod.get(buildPeriodGroupKey(counter));
    const budget = computeCounterBudget({ counter, allowance });

    if (ttl <= 0 || !isDefined(rows) || !isDefined(budget)) {
      return [];
    }

    return [
      {
        key: counter.key,
        value: budget - computeQuotaConsumed({ rows, counter }),
        ttl,
      },
    ];
  });
