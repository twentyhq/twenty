import { type FlatStockLimit } from 'src/engine/core-modules/usage-limit/types/flat-stock-limit.type';
import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { buildStockCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter-key.util';
import { normalizeSpenderId } from 'src/engine/core-modules/usage-limit/utils/normalize-spender-id.util';

export const buildStockCounter = ({
  workspaceId,
  limit,
}: {
  workspaceId: string;
  limit: FlatStockLimit;
}): StockCounter => ({
  key: buildStockCounterKey({
    workspaceId,
    resourceType: limit.resourceType,
    operationType: limit.operationType,
    spenderType: limit.spenderType,
    spenderId: limit.spenderId,
    meter: limit.meter,
  }),
  isDefault: false,
  limitValue: limit.limitValue,
  meter: limit.meter,
  resourceType: limit.resourceType,
  operationType: limit.operationType,
  spenderType: limit.spenderType,
  spenderId: normalizeSpenderId(limit.spenderId),
});
