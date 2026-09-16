import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';

export const buildStockScopeKey = (counter: StockCounter): string =>
  `${counter.resourceType}:${counter.spenderType}:${counter.spenderId ?? '-'}`;
