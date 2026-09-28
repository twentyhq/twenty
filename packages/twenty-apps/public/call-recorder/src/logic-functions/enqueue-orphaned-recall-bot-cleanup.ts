import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  CLEANUP_ORPHANED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  ENQUEUE_ORPHANED_RECALL_BOT_CLEANUP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { CLEANUP_ORPHANED_RECALL_BOTS_CRON_PATTERN } from 'src/logic-functions/constants/cleanup-orphaned-recall-bots-cron-pattern';
import {
  enqueueWorkspaceDistributedJob,
  type EnqueueWorkspaceDistributedJobResult,
} from 'src/logic-functions/data/enqueue-workspace-distributed-job.util';

export const enqueueOrphanedRecallBotCleanupHandler = (
  _payload: unknown,
  { workspaceId }: LogicFunctionExecutionContext,
): Promise<EnqueueWorkspaceDistributedJobResult> =>
  enqueueWorkspaceDistributedJob({
    workspaceId,
    logicFunctionUniversalIdentifier:
      CLEANUP_ORPHANED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    stepLabel: 'orphaned Recall bot cleanup enqueueing',
  });

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
