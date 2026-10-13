import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { type StockLimitDefault } from 'src/engine/core-modules/usage-limit/types/stock-limit-default.type';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';
import { buildStockCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter-key.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const buildStockDefaultCounter = ({
  workspaceId,
  resourceType,
  operationType,
  stockLimitDefault,
}: {
  workspaceId: string;
  resourceType: StockResourceType;
  operationType: UsageOperationType;
  stockLimitDefault: StockLimitDefault;
}): StockCounter => {
  const counter: Omit<StockCounter, 'key'> = {
    isDefault: true,
    limitValue: stockLimitDefault.limitValue,
    unit: stockLimitDefault.unit,
    resourceType,
    operationType,
    spenderType: stockLimitDefault.spenderType,
    spenderId: null,
  };

  return { ...counter, key: buildStockCounterKey({ workspaceId, counter }) };
};
