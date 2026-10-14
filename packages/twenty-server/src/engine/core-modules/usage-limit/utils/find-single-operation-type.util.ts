import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

// TODO: remove once usage limits can target several operation types
export const findSingleOperationType = (
  operationTypes: UsageOperationType[],
): UsageOperationType | null =>
  operationTypes.length === 1 ? operationTypes[0] : null;
