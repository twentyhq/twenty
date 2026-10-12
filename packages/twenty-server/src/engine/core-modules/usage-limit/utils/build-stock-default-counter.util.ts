import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { type StockLimitDefault } from 'src/engine/core-modules/usage-limit/types/stock-limit-default.type';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';
import { buildStockCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter-key.util';

export const buildStockDefaultCounter = ({
  workspaceId,
  resourceType,
  stockLimitDefault,
}: {
  workspaceId: string;
  resourceType: StockResourceType;
  stockLimitDefault: StockLimitDefault;
}): StockCounter => {
  const counter: Omit<StockCounter, 'key'> = {
    isDefault: true,
    limitValue: stockLimitDefault.limitValue,
    unit: stockLimitDefault.unit,
    resourceType,
    spenderType: stockLimitDefault.spenderType,
    spenderId: null,
  };

  return { ...counter, key: buildStockCounterKey({ workspaceId, counter }) };
};
