import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  ENQUEUE_PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { PENDING_CALL_RECORDING_REQUESTS_CRON_PATTERN } from 'src/logic-functions/constants/pending-call-recording-requests-cron-pattern';
import {
  enqueueWorkspaceDistributedJob,
  type EnqueueWorkspaceDistributedJobResult,
} from 'src/logic-functions/data/enqueue-workspace-distributed-job.util';

export const enqueuePendingCallRecordingRequestsHandler = (
  _payload: unknown,
  { workspaceId }: LogicFunctionExecutionContext,
): Promise<EnqueueWorkspaceDistributedJobResult> => {
  return enqueueWorkspaceDistributedJob({
    workspaceId,
    logicFunctionUniversalIdentifier:
      PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    stepLabel: 'pending call recording requests enqueueing',
  });
};

export default defineLogicFunction({
  universalIdentifier:
    ENQUEUE_PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'enqueue-pending-call-recording-requests',
  description:
    'Enqueues pending CallRecording request processing at a stable workspace-specific delay to distribute Recall API traffic.',
  timeoutSeconds: 30,
  handler: enqueuePendingCallRecordingRequestsHandler,
  cronTriggerSettings: {
    pattern: PENDING_CALL_RECORDING_REQUESTS_CRON_PATTERN,
  },
});
