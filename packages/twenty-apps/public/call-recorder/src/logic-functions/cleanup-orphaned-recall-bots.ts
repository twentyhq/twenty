import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { CLEANUP_ORPHANED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/cleanup-orphaned-recall-bots-logic-function-universal-identifier';
import { CLEANUP_ORPHANED_RECALL_BOTS_CRON_PATTERN } from 'src/logic-functions/constants/cleanup-orphaned-recall-bots-cron-pattern';
import {
  cleanupOrphanedRecallBots,
  type CleanupOrphanedRecallBotsResult,
} from 'src/logic-functions/flows/cleanup-orphaned-recall-bots.util';
import {
  buildStepFailure,
  type StepFailure,
} from 'src/logic-functions/utils/build-step-failure.util';

// Pending requests handle incomplete cancellation and bot-id write-back; this daily list fetch only finds unclaimed Recall bots.
const ORPHANED_BOT_JOIN_AT_LOOKBACK_HOURS = 25;
const ORPHANED_BOT_JOIN_AT_LOOKAHEAD_HOURS = 24;

const cleanupOrphanedRecallBotsHandler = async (): Promise<
  CleanupOrphanedRecallBotsResult | StepFailure
> => {
  const now = new Date();

  try {
    return await cleanupOrphanedRecallBots({
      client: new CoreApiClient(),
      joinAtAfter: new Date(
        now.getTime() - ORPHANED_BOT_JOIN_AT_LOOKBACK_HOURS * 60 * 60 * 1000,
      ).toISOString(),
      joinAtBefore: new Date(
        now.getTime() + ORPHANED_BOT_JOIN_AT_LOOKAHEAD_HOURS * 60 * 60 * 1000,
      ).toISOString(),
    });
  } catch (error) {
    return buildStepFailure('orphaned bot cancellation', error);
  }
};

export default defineLogicFunction({
  universalIdentifier:
    CLEANUP_ORPHANED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cleanup-orphaned-recall-bots',
  description:
    'Daily cleanup that lists workspace Recall bots and cancels those no CallRecording request claims.',
  timeoutSeconds: 250,
  handler: cleanupOrphanedRecallBotsHandler,
  cronTriggerSettings: {
    pattern: CLEANUP_ORPHANED_RECALL_BOTS_CRON_PATTERN,
  },
});
