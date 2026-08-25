import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/backfill-call-recording-summaries-logic-function-universal-identifier';
import { enqueueCallRecordingSummariesBackfill } from 'src/logic-functions/flows/enqueue-call-recording-summaries-backfill.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { isCallRecordingSummaryEnabled } from 'src/logic-functions/utils/is-call-recording-summary-enabled.util';

type BackfillCallRecordingSummariesResult =
  | { outcome: 'disabled' }
  | { outcome: 'nothing-to-summarize' }
  | {
      outcome: 'batches-enqueued';
      callRecordingCount: number;
      batchCount: number;
    };

export const backfillCallRecordingSummariesHandler =
  async (): Promise<BackfillCallRecordingSummariesResult> => {
    if (!isCallRecordingSummaryEnabled()) {
      return { outcome: 'disabled' };
    }

    try {
      const { callRecordingCount, batchCount } =
        await enqueueCallRecordingSummariesBackfill({
          client: new CoreApiClient(),
        });

      if (callRecordingCount === 0) {
        return { outcome: 'nothing-to-summarize' };
      }

      return { outcome: 'batches-enqueued', callRecordingCount, batchCount };
    } catch (error) {
      throw buildRetryableStepFailure(
        'call recording summaries backfill',
        error,
      );
    }
  };

export default defineLogicFunction({
  universalIdentifier:
    BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-call-recording-summaries',
  description:
    'Finds this app’s call recordings that have a transcript but no summary and enqueues one summary generation job per batch.',
  timeoutSeconds: 250,
  handler: backfillCallRecordingSummariesHandler,
});
