import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const findSingleOperationType = (
  operationTypes: UsageOperationType[],
): UsageOperationType | null =>
  operationTypes.length === 1 ? operationTypes[0] : null;
