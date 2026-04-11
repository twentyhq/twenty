/* @license Enterprise */

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

// Operation types that count toward the WORKFLOW_NODE_EXECUTION metered product's
// credit cap. The underlying Stripe meter is historically named WORKFLOW_NODE_RUN
// but its unit is credits (creditsUsedMicro) sent via
// StripeBillingMeterEventService.sendBillingMeterEvent. Keep this list in sync
// with whatever UsageOperationType values are emitted under the metered product.
export const METERED_OPERATION_TYPES: readonly UsageOperationType[] = [
  UsageOperationType.WORKFLOW_EXECUTION,
];
