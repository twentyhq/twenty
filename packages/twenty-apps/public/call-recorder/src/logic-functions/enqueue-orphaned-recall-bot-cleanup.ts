import {
  enqueueJobs,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  CLEANUP_ORPHANED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  ENQUEUE_ORPHANED_RECALL_BOT_CLEANUP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { CLEANUP_ORPHANED_RECALL_BOTS_CRON_PATTERN } from 'src/logic-functions/constants/cleanup-orphaned-recall-bots-cron-pattern';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { computeOrphanedRecallBotCleanupDelay } from 'src/logic-functions/domain/compute-orphaned-recall-bot-cleanup-delay.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

type EnqueueOrphanedRecallBotCleanupResult = {
  delayMs: number;
};

export const enqueueOrphanedRecallBotCleanupHandler = async (
  _payload: unknown,
  { workspaceId }: LogicFunctionExecutionContext,
): Promise<EnqueueOrphanedRecallBotCleanupResult> => {
  const delayMs = computeOrphanedRecallBotCleanupDelay(workspaceId);

  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        CLEANUP_ORPHANED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs,
    });
  } catch (error) {
    throw buildRetryableStepFailure(
      'orphaned Recall bot cleanup enqueueing',
      error,
    );
  }

  return { delayMs };
};

export default defineLogicFunction({
  universalIdentifier:
    ENQUEUE_ORPHANED_RECALL_BOT_CLEANUP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'enqueue-orphaned-recall-bot-cleanup',
  description:
    'Enqueues orphaned Recall bot cleanup at a stable workspace-specific delay to distribute Recall API traffic.',
  timeoutSeconds: 30,
  handler: enqueueOrphanedRecallBotCleanupHandler,
  cronTriggerSettings: {
    pattern: CLEANUP_ORPHANED_RECALL_BOTS_CRON_PATTERN,
  },
});
