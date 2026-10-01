import { STOCK_METERS } from 'src/engine/core-modules/usage-limit/constants/usage-meters.constant';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';

export const isStockMeter = (meter: UsageMeter): meter is StockMeter =>
  STOCK_METERS.includes(meter as StockMeter);
