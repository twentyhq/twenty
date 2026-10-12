import { isDefined } from 'twenty-shared/utils';

import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { buildStockScopeKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-scope-key.util';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export const buildStockWarmedEntries = ({
  coldCounters,
  usedByScope,
  ttl,
}: {
  coldCounters: StockCounter[];
  usedByScope: Map<string, Partial<Record<UsageUnit, number>>>;
  ttl: number;
}): { key: string; value: number; ttl: number }[] =>
  coldCounters.flatMap((counter) => {
    const used = usedByScope.get(buildStockScopeKey(counter))?.[counter.unit];

    return isDefined(used)
      ? [{ key: counter.key, value: counter.limitValue - used, ttl }]
      : [];
  });
