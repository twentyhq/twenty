import { type QuotaOperationScope } from 'src/engine/core-modules/usage-limit/types/quota-operation-scope.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const isOperationInScope = ({
  operationScope,
  operationType,
}: {
  operationScope: QuotaOperationScope;
  operationType: string;
}): boolean =>
  Array.isArray(operationScope)
    ? operationScope.some(
        (scopeOperationType) => scopeOperationType === operationType,
      )
    : operationScope === UsageOperationType.ALL ||
      operationScope === operationType;
