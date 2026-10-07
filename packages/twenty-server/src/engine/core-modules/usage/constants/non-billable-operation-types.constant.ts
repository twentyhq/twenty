/* @license Enterprise */

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

// Recorded at their real cost for staff, but kept out of the credit allowance, every billing sum and every customer usage view.
export const NON_BILLABLE_OPERATION_TYPES: UsageOperationType[] = [
  UsageOperationType.AI_CHAT_INCLUDED,
];
