import { type FlatStockLimit } from 'src/engine/core-modules/usage-limit/types/flat-stock-limit.type';
import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { type StockLimitDefault } from 'src/engine/core-modules/usage-limit/types/stock-limit-default.type';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { buildStockCounter } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter.util';
import { buildStockDefaultCounter } from 'src/engine/core-modules/usage-limit/utils/build-stock-default-counter.util';
import { findLimitsForSpender } from 'src/engine/core-modules/usage-limit/utils/find-limits-for-spender.util';
import { findStockOperationType } from 'src/engine/core-modules/usage-limit/utils/find-stock-operation-type.util';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

export const buildStockCounters = ({
  workspaceId,
  resourceType,
  usageSpenders,
  limits,
  stockLimitDefaults,
}: {
  workspaceId: string;
  resourceType: StockResourceType;
  usageSpenders: UsageSpenders;
  limits: FlatStockLimit[];
  stockLimitDefaults: StockLimitDefault[];
}): StockCounter[] => {
  const operationType = findStockOperationType(resourceType);
  const spenders = buildSpendersFromUsageSpenders(usageSpenders);

  const limitCounters = spenders
    .flatMap((spender) =>
      findLimitsForSpender({ limits, spender, operationType }),
    )
    .map((limit) => buildStockCounter({ workspaceId, limit }));

  const spenderTypes = new Set(spenders.map((spender) => spender.spenderType));

  const defaultCounters = stockLimitDefaults
    .filter(
      (stockLimitDefault) =>
        spenderTypes.has(stockLimitDefault.spenderType) &&
        !(
          stockLimitDefault.isOverridable &&
          limitCounters.some(
            (counter) =>
              counter.resourceType === resourceType &&
              counter.spenderType === stockLimitDefault.spenderType &&
              counter.spenderId === null &&
              counter.unit === stockLimitDefault.unit,
          )
        ),
    )
    .map((stockLimitDefault) =>
      buildStockDefaultCounter({
        workspaceId,
        resourceType,
        stockLimitDefault,
      }),
    );

  return [...limitCounters, ...defaultCounters];
};
