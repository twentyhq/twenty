import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { isBillableOperationType } from 'src/engine/core-modules/usage/utils/is-billable-operation-type.util';

// ALL covers billable operations only, so the allowance and customer limits never count non-billable usage.
export const doesOperationTypeMatchScope = ({
  scopeOperationType,
  operationType,
}: {
  scopeOperationType: UsageOperationType;
  operationType: string;
}): boolean =>
  operationType === scopeOperationType ||
  (scopeOperationType === UsageOperationType.ALL &&
    isBillableOperationType(operationType));
