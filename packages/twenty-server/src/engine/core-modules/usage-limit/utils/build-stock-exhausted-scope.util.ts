import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';

export const buildStockExhaustedScope = ({
  counter,
  remaining,
}: {
  counter: StockCounter;
  remaining: number;
}): ExhaustedScope => ({
  resourceType: counter.resourceType,
  limitKind: 'stock',
  exhaustedKind: 'limit',
  spenderType: counter.spenderType,
  spenderId: counter.spenderId,
  operationType: counter.operationType,
  limitValue: counter.limitValue,
  remaining,
  periodCount: null,
  periodUnit: null,
  retryAfterMs: 0,
  isDefault: counter.isDefault,
});
