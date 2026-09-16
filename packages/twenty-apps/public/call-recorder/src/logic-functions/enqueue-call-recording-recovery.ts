import {
  enqueueJobs,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  ENQUEUE_CALL_RECORDING_RECOVERY_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { STALE_BOT_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-bot-state-cron-pattern';
import { computeCallRecordingRecoveryDelay } from 'src/logic-functions/domain/compute-call-recording-recovery-delay.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

type EnqueueCallRecordingRecoveryResult = {
  delayMs: number;
};

export const enqueueCallRecordingRecoveryHandler = async (
  _payload: unknown,
  { workspaceId }: LogicFunctionExecutionContext,
): Promise<EnqueueCallRecordingRecoveryResult> => {
  const delayMs = computeCallRecordingRecoveryDelay(workspaceId);

  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs,
    });
  } catch (error) {
    throw buildRetryableStepFailure(
      'call recording recovery enqueueing',
      error,
    );
  }

  return { delayMs };
};

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
