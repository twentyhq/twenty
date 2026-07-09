import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { REAP_ORPHANED_CALL_RECORDERS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reap-orphaned-call-recorders-logic-function-universal-identifier';
import { REAP_ORPHANED_CALL_RECORDERS_CRON_PATTERN } from 'src/logic-functions/constants/reap-orphaned-call-recorders-cron-pattern';
import {
  reapOrphanedCallRecorders,
  type ReapOrphanedCallRecordersResult,
} from 'src/logic-functions/flows/reap-orphaned-call-recorders.util';

// Failed cancellations and bot-id write-back crashes are healed DB-first within minutes; this daily list scan only catches bots no local record points at anymore.
const REAPER_JOIN_AT_LOOKBACK_HOURS = 25;
const REAPER_JOIN_AT_LOOKAHEAD_HOURS = 24;

type StepFailure = { error: string };

const reapOrphanedCallRecordersHandler = async (): Promise<
  ReapOrphanedCallRecordersResult | StepFailure
> => {
  const now = new Date();

  try {
    return await reapOrphanedCallRecorders({
      client: new CoreApiClient(),
      joinAtAfter: new Date(
        now.getTime() - REAPER_JOIN_AT_LOOKBACK_HOURS * 60 * 60 * 1000,
      ).toISOString(),
      joinAtBefore: new Date(
        now.getTime() + REAPER_JOIN_AT_LOOKAHEAD_HOURS * 60 * 60 * 1000,
      ).toISOString(),
    });
  } catch (error) {
    return buildStepFailure('orphaned bot reaping', error);
  }
};

const buildStepFailure = (stepLabel: string, error: unknown): StepFailure => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[call-recorder] ${stepLabel} failed: ${errorMessage}`);
  }

  return { error: `${stepLabel} failed` };
};

export default defineLogicFunction({
  universalIdentifier:
    REAP_ORPHANED_CALL_RECORDERS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reap-orphaned-call-recorders',
  description:
    'Daily janitor that lists Recall bots in a join window and cancels the ones no CallRecording claims.',
  timeoutSeconds: 250,
  handler: reapOrphanedCallRecordersHandler,
  cronTriggerSettings: {
    pattern: REAP_ORPHANED_CALL_RECORDERS_CRON_PATTERN,
  },
});
