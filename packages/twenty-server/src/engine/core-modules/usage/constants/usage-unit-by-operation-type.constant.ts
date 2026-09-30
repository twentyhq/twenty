import { type UsageOperationTypeValue } from 'twenty-shared/application';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

// An app sends a quantity and never a unit, so the platform names what the
// number counts. Keyed on the app-facing vocabulary, so adding a value to
// twenty-shared's USAGE_OPERATION_TYPES fails to compile until it has a unit.
export const USAGE_UNIT_BY_OPERATION_TYPE: Record<
  (typeof UsageOperationType)[UsageOperationTypeValue],
  UsageUnit
> = {
  [UsageOperationType.AI_CHAT_TOKEN]: UsageUnit.TOKEN,
  [UsageOperationType.AI_WORKFLOW_TOKEN]: UsageUnit.TOKEN,
  [UsageOperationType.WORKFLOW_EXECUTION]: UsageUnit.INVOCATION,
  [UsageOperationType.CODE_EXECUTION]: UsageUnit.INVOCATION,
  [UsageOperationType.WEB_SEARCH]: UsageUnit.INVOCATION,
  [UsageOperationType.CALL_RECORDING]: UsageUnit.MINUTE,
  [UsageOperationType.EMAIL_SEND]: UsageUnit.INVOCATION,
};
