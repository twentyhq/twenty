import { type FlatStockLimit } from 'src/engine/core-modules/usage-limit/types/flat-stock-limit.type';
import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { type StockLimitDefault } from 'src/engine/core-modules/usage-limit/types/stock-limit-default.type';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { buildStockCounter } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter.util';
import { buildStockDefaultCounter } from 'src/engine/core-modules/usage-limit/utils/build-stock-default-counter.util';
import { findStockLimitsForSpenders } from 'src/engine/core-modules/usage-limit/utils/find-stock-limits-for-spenders.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

export const buildStockCounters = ({
  workspaceId,
  resourceType,
  operationType,
  spenders,
  limits,
  stockLimitDefaults,
}: {
  workspaceId: string;
  resourceType: StockResourceType;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
  limits: FlatStockLimit[];
  stockLimitDefaults: StockLimitDefault[];
}): StockCounter[] => {
  const limitCounters = findStockLimitsForSpenders({
    limits,
    usageSpenders: spenders,
    operationType,
  }).map((limit) => buildStockCounter({ workspaceId, limit }));

  const spenderTypes = new Set(
    buildSpendersFromUsageSpenders(spenders).map(
      (spender) => spender.spenderType,
    ),
  );

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
              counter.meter === stockLimitDefault.meter,
          )
        ),
    )
    .map((stockLimitDefault) =>
      buildStockDefaultCounter({
        workspaceId,
        resourceType,
        operationType,
        stockLimitDefault,
      }),
    );

  return [...limitCounters, ...defaultCounters];
};
