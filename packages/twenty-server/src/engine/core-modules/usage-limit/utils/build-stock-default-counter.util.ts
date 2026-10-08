import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { type StockLimitDefault } from 'src/engine/core-modules/usage-limit/types/stock-limit-default.type';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';
import { buildStockDefaultCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-default-counter-key.util';
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
}): StockCounter => ({
  key: buildStockDefaultCounterKey({
    workspaceId,
    resourceType,
    operationType,
    spenderType: stockLimitDefault.spenderType,
    unit: stockLimitDefault.unit,
    limitValue: stockLimitDefault.limitValue,
  }),
  isDefault: true,
  limitValue: stockLimitDefault.limitValue,
  unit: stockLimitDefault.unit,
  resourceType,
  operationType,
  spenderType: stockLimitDefault.spenderType,
  spenderId: null,
});
