import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { CANCEL_ORPHANED_CALL_RECORDERS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/cancel-orphaned-call-recorders-logic-function-universal-identifier';
import { CANCEL_ORPHANED_CALL_RECORDERS_CRON_PATTERN } from 'src/logic-functions/constants/cancel-orphaned-call-recorders-cron-pattern';
import {
  cancelOrphanedCallRecorders,
  type CancelOrphanedCallRecordersResult,
} from 'src/logic-functions/flows/cancel-orphaned-call-recorders.util';
import {
  buildStepFailure,
  type StepFailure,
} from 'src/logic-functions/utils/build-step-failure.util';

// Failed cancellations and bot-id write-back crashes are healed DB-first within minutes; this daily list scan only catches bots no local record points at anymore.
const ORPHANED_BOT_JOIN_AT_LOOKBACK_HOURS = 25;
const ORPHANED_BOT_JOIN_AT_LOOKAHEAD_HOURS = 24;

const cancelOrphanedCallRecordersHandler = async (): Promise<
  CancelOrphanedCallRecordersResult | StepFailure
> => {
  const now = new Date();

  try {
    return await cancelOrphanedCallRecorders({
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
    CANCEL_ORPHANED_CALL_RECORDERS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cancel-orphaned-call-recorders',
  description:
    'Daily janitor that lists Recall bots in a join window and cancels the ones no CallRecording claims.',
  timeoutSeconds: 250,
  handler: cancelOrphanedCallRecordersHandler,
  cronTriggerSettings: {
    pattern: CANCEL_ORPHANED_CALL_RECORDERS_CRON_PATTERN,
  },
});
