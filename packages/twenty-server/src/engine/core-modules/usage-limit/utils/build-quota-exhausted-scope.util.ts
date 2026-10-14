import { assertUnreachable } from 'twenty-shared/utils';

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

  switch (counter.kind) {
    case 'limit':
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
    case 'workspaceAllowance':
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
    case 'userAllowance':
      return {
        resourceType,
        limitKind: 'quota',
        exhaustedKind: 'userAllowance',
        spenderType: 'userWorkspace',
        spenderId: counter.userWorkspaceId,
        operationType: UsageOperationType.ALL,
        unit: counter.unit,
        limitValue: counter.limitValue,
        remaining: 0,
        periodCount: null,
        periodUnit: null,
        retryAfterMs,
      };
    default:
      return assertUnreachable(counter);
  }
};
