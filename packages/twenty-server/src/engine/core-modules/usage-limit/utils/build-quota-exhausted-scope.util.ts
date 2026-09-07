import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const buildQuotaExhaustedScope = ({
  resourceType,
  counter,
  allowance,
}: {
  resourceType: UsageResourceType;
  counter: QuotaCounter;
  allowance: CreditAllowance | null;
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
      limitValue: counter.limitValue,
      remaining: 0,
      periodCount: 1,
      periodUnit: counter.periodUnit,
      retryAfterMs,
    };
  }

  return {
    resourceType,
    limitKind: 'quota',
    exhaustedKind: 'allowance',
    spenderType: 'workspace',
    spenderId: null,
    operationType: UsageOperationType.ALL,
    limitValue: allowance?.allowanceMicro ?? 0,
    remaining: 0,
    periodCount: null,
    periodUnit: null,
    retryAfterMs,
  };
};
