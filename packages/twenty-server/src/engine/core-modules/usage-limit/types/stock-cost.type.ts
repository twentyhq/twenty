import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';

export type StockCost = Partial<Record<StockMeter, number>>;
