import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { type StockScope } from 'src/engine/core-modules/usage-limit/types/stock-scope.type';

export type ComputeUsedStock = (
  scope: StockScope,
) => Promise<Record<StockMeter, number>>;
