import { findSingleOperationType } from 'src/engine/core-modules/usage-limit/utils/find-single-operation-type.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

// A row holds one operation, so an ALL row overrides a default spanning several
export const getUsageLimitDefaultOverrideOperationType = (
  operationTypes: UsageOperationType[],
): UsageOperationType =>
  findSingleOperationType(operationTypes) ?? UsageOperationType.ALL;
