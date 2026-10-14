import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export type UsageLimitDefaultOperations =
  | { operationType: UsageOperationType }
  | { operationTypes: UsageOperationType[] };

export const getUsageLimitDefaultOperationTypes = (
  usageLimitDefault: UsageLimitDefaultOperations,
): UsageOperationType[] =>
  'operationTypes' in usageLimitDefault
    ? usageLimitDefault.operationTypes
    : [usageLimitDefault.operationType];
