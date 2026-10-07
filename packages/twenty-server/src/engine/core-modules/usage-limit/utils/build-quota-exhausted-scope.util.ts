import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const buildQuotaExhaustedScope = ({
  resourceType,
  counter,
}: {
  resourceType: UsageResourceType;
  counter: QuotaCounter;
}): ExhaustedScope => {
  const retryAfterMs = Math.max(counter.periodEnd.getTime() - Date.now(), 0);

  if (counter.kind === 'limit') {
    return {
      resourceType,
      limitKind: 'quota',
      exhaustedKind: 'limit',
      spenderType: counter.spenderType,
      spenderId: counter.spenderId,
      operationType: counter.operationType,
      unit: counter.unit,
      limitValue: counter.limitValue,
      remaining: 0,
      periodCount: 1,
      periodUnit: counter.periodUnit,
      retryAfterMs,
      isDefault: counter.isDefault,
    };
  }

  return {
    resourceType,
    limitKind: 'quota',
    exhaustedKind: 'allowance',
    spenderType: 'workspace',
    spenderId: null,
    operationType: UsageOperationType.ALL,
    unit: counter.unit,
    limitValue: counter.limitValue,
    remaining: 0,
    periodCount: null,
    periodUnit: null,
    retryAfterMs,
  };
};
