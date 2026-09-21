import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  ENQUEUE_CALL_RECORDING_RECOVERY_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { STALE_BOT_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-bot-state-cron-pattern';
import {
  enqueueWorkspaceDistributedJob,
  type EnqueueWorkspaceDistributedJobResult,
} from 'src/logic-functions/data/enqueue-workspace-distributed-job.util';

export const enqueueCallRecordingRecoveryHandler = (
  _payload: unknown,
  { workspaceId }: LogicFunctionExecutionContext,
): Promise<EnqueueWorkspaceDistributedJobResult> =>
  enqueueWorkspaceDistributedJob({
    workspaceId,
    logicFunctionUniversalIdentifier:
      STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    stepLabel: 'call recording recovery enqueueing',
  });

export default defineLogicFunction({
  universalIdentifier:
    ENQUEUE_CALL_RECORDING_RECOVERY_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'enqueue-call-recording-recovery',
  description:
    'Enqueues call recording recovery at a stable workspace-specific delay to distribute Recall API traffic.',
  timeoutSeconds: 30,
  handler: enqueueCallRecordingRecoveryHandler,
  cronTriggerSettings: {
    pattern: STALE_BOT_STATE_CRON_PATTERN,
  },
});
