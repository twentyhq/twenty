import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { findSingleOperationType } from 'src/engine/core-modules/usage-limit/utils/find-single-operation-type.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const buildQuotaExhaustedScope = ({
  resourceType,
  operationType,
  counter,
}: {
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  counter: QuotaCounter;
}): ExhaustedScope => {
  const retryAfterMs = Math.max(counter.periodEnd.getTime() - Date.now(), 0);

  if (counter.kind === 'workspaceAllowance') {
    return {
      resourceType,
      limitKind: 'quota',
      exhaustedKind: 'workspaceAllowance',
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
  }

  return {
    resourceType: counter.resourceType,
    limitKind: 'quota',
    exhaustedKind: counter.kind,
    spenderType: counter.spenderType,
    spenderId: counter.spenderId,
    operationType:
      findSingleOperationType(counter.operationTypes) ?? operationType,
    unit: counter.unit,
    limitValue: counter.limitValue,
    remaining: 0,
    periodCount: 1,
    periodUnit: counter.periodUnit,
    retryAfterMs,
    isDefault: counter.isDefault,
  };
};
