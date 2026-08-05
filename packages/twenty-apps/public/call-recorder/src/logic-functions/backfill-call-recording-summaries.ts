import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/backfill-call-recording-summaries-logic-function-universal-identifier';
import { enqueueCallRecordingSummaryJobs } from 'src/logic-functions/data/enqueue-call-recording-summary-jobs.util';
import { findCallRecordingIdsMissingSummary } from 'src/logic-functions/data/find-call-recording-ids-missing-summary.util';
import { isCallRecordingSummaryEnabled } from 'src/logic-functions/utils/is-call-recording-summary-enabled.util';

type BackfillCallRecordingSummariesResult =
  | { outcome: 'disabled' }
  | { outcome: 'nothing-to-summarize' }
  | { outcome: 'summary-jobs-enqueued'; enqueuedJobCount: number };

export const backfillCallRecordingSummariesHandler =
  async (): Promise<BackfillCallRecordingSummariesResult> => {
    if (!isCallRecordingSummaryEnabled()) {
      return { outcome: 'disabled' };
    }

    const callRecordingIds = await findCallRecordingIdsMissingSummary(
      new CoreApiClient(),
    );

    if (callRecordingIds.length === 0) {
      return { outcome: 'nothing-to-summarize' };
    }

    const { enqueuedJobCount } = await enqueueCallRecordingSummaryJobs({
      callRecordingIds,
    });

    return { outcome: 'summary-jobs-enqueued', enqueuedJobCount };
  };

export default defineLogicFunction({
  universalIdentifier:
    BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-call-recording-summaries',
  description:
    'Discovers this app’s call recordings that have a transcript but no summary and enqueues one summary generation job per recording.',
  timeoutSeconds: 250,
  handler: backfillCallRecordingSummariesHandler,
});
