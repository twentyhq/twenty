import { USAGE_LIMIT_DEFINITIONS } from 'src/engine/core-modules/usage-limit/constants/usage-limit-definitions.constant';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const isStockResourceType = (
  resourceType: UsageResourceType,
): resourceType is StockResourceType =>
  'stock' in USAGE_LIMIT_DEFINITIONS[resourceType];
