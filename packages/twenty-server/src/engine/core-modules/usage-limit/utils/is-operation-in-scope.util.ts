import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const isOperationInScope = ({
  operationTypes,
  operationType,
}: {
  operationTypes: UsageOperationType[];
  operationType: string;
}): boolean =>
  operationTypes.some(
    (scopeOperationType) =>
      scopeOperationType === UsageOperationType.ALL ||
      scopeOperationType === operationType,
  );
