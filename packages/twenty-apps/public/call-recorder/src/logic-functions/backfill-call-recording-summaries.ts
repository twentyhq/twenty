import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/backfill-call-recording-summaries-logic-function-universal-identifier';
import { SUMMARY_BACKFILL_CRON_PATTERN } from 'src/logic-functions/constants/summary-backfill-cron-pattern';
import { healCallRecordingsMissingSummary } from 'src/logic-functions/flows/heal-call-recordings-missing-summary.util';

const backfillCallRecordingSummariesHandler = async (): Promise<object> => {
  const client = new CoreApiClient();

  try {
    return await healCallRecordingsMissingSummary({ client, now: new Date() });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (process.env.NODE_ENV !== 'test') {
      console.error(`[call-recorder] summary backfill failed: ${errorMessage}`);
    }

    return { error: 'summary backfill failed' };
  }
};

export default defineLogicFunction({
  universalIdentifier:
    BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-call-recording-summaries',
  description:
    'Sweeps completed call recordings that have a transcript but no summary and generates the missing summaries a few per run, newest first. Covers recordings that predate summaries and recordings whose summarizer run failed.',
  timeoutSeconds: 250,
  handler: backfillCallRecordingSummariesHandler,
  cronTriggerSettings: {
    pattern: SUMMARY_BACKFILL_CRON_PATTERN,
  },
});
