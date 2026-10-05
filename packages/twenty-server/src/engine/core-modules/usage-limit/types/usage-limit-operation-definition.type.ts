import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export type UsageLimitOperationDefinition = {
  operationType: UsageOperationType;
  allowedUnits: UsageUnit[];
};
