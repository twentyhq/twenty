import { NON_BILLABLE_OPERATION_TYPES } from 'src/engine/core-modules/usage/constants/non-billable-operation-types.constant';

// Takes a string because ClickHouse rows carry the operation type untyped.
export const isBillableOperationType = (operationType: string): boolean =>
  !NON_BILLABLE_OPERATION_TYPES.some(
    (nonBillableOperationType) => nonBillableOperationType === operationType,
  );
