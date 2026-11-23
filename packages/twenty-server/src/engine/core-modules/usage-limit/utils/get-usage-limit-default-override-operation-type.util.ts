import { findSingleOperationType } from 'src/engine/core-modules/usage-limit/utils/find-single-operation-type.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const getUsageLimitDefaultOverrideOperationType = (
  operationTypes: UsageOperationType[],
): UsageOperationType =>
  findSingleOperationType(operationTypes) ?? UsageOperationType.ALL;
