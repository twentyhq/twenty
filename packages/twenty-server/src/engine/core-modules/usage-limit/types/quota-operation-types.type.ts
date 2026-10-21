import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export type QuotaOperationTypes = [UsageOperationType, ...UsageOperationType[]];
