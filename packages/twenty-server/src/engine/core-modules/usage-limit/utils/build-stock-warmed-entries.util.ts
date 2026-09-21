import { isDefined } from 'twenty-shared/utils';

import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { buildStockScopeKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-scope-key.util';

export const buildStockWarmedEntries = ({
  coldCounters,
  usedByScope,
  ttl,
}: {
  coldCounters: StockCounter[];
  usedByScope: Map<string, Record<StockMeter, number>>;
  ttl: number;
}): { key: string; value: number; ttl: number }[] =>
  coldCounters.flatMap((counter) => {
    const used = usedByScope.get(buildStockScopeKey(counter))?.[counter.meter];

    return isDefined(used)
      ? [{ key: counter.key, value: counter.limitValue - used, ttl }]
      : [];
  });
