import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

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
  operationType: UsageOperationType.ALL,
  limitValue: counter.limitValue,
  remaining,
  periodCount: null,
  periodUnit: null,
  retryAfterMs: 0,
});
