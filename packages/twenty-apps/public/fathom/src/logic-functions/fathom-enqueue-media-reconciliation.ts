import { defineLogicFunction } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { FATHOM_MEDIA_RECONCILIATION_CRON_PATTERN } from 'src/constants/fathom.constant';
import {
  FATHOM_ENQUEUE_MEDIA_RECONCILIATION_UNIVERSAL_IDENTIFIER,
  FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { enqueueWorkspaceDistributedJob } from 'src/logic-functions/utils/enqueue-workspace-distributed-job.util';

export const fathomEnqueueMediaReconciliationHandler = (
  _payload: unknown,
  { workspaceId }: LogicFunctionExecutionContext,
) =>
  enqueueWorkspaceDistributedJob({
    workspaceId,
    logicFunctionUniversalIdentifier:
      FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER,
    operation: 'media import reconciliation enqueueing',
  });

export default defineLogicFunction({
  universalIdentifier: FATHOM_ENQUEUE_MEDIA_RECONCILIATION_UNIVERSAL_IDENTIFIER,
  name: 'fathom-enqueue-media-reconciliation',
  description:
    'Enqueues the daily Fathom media reconciliation at a stable workspace-specific delay to spread Twenty API traffic.',
  timeoutSeconds: 30,
  handler: fathomEnqueueMediaReconciliationHandler,
  cronTriggerSettings: {
    pattern: FATHOM_MEDIA_RECONCILIATION_CRON_PATTERN,
  },
});
