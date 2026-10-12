import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';

export const buildStockExhaustedScope = ({
  counter,
  held,
}: {
  counter: StockCounter;
  held: number;
}): ExhaustedScope => ({
  resourceType: counter.resourceType,
  limitKind: 'stock',
  exhaustedKind: 'limit',
  spenderType: counter.spenderType,
  spenderId: counter.spenderId,
  operationType: counter.operationType,
  unit: counter.unit,
  limitValue: counter.limitValue,
  remaining: counter.limitValue - held,
  periodCount: null,
  periodUnit: null,
  retryAfterMs: 0,
  isDefault: counter.isDefault,
});
