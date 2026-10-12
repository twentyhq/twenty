import { USAGE_LIMIT_DEFINITIONS } from 'src/engine/core-modules/usage-limit/constants/usage-limit-definitions.constant';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const findStockOperationType = (
  resourceType: StockResourceType,
): UsageOperationType =>
  USAGE_LIMIT_DEFINITIONS[resourceType].stock.allowedOperations[0]
    .operationType;
