import { type FlatStockLimit } from 'src/engine/core-modules/usage-limit/types/flat-stock-limit.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { isStockMeter } from 'src/engine/core-modules/usage-limit/utils/is-stock-meter.util';
import { isStockResourceType } from 'src/engine/core-modules/usage-limit/utils/is-stock-resource-type.util';

export const isStockLimit = (limit: FlatUsageLimit): limit is FlatStockLimit =>
  limit.limitKind === 'stock' &&
  isStockMeter(limit.meter) &&
  isStockResourceType(limit.resourceType);
