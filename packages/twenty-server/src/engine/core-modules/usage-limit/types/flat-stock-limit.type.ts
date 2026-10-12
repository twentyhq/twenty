import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';

export type FlatStockLimit = Omit<FlatUsageLimit, 'resourceType'> & {
  resourceType: StockResourceType;
};
