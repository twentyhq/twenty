import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import {
  cancelScheduledRecallBots,
  type CancelScheduledRecallBotsResult,
} from 'src/logic-functions/flows/cancel-scheduled-recall-bots.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

export const cancelScheduledRecallBotsHandler =
  async (): Promise<CancelScheduledRecallBotsResult> => {
    try {
      const result = await cancelScheduledRecallBots({
        client: new CoreApiClient(),
      });

      if (result.hasMore) {
        await enqueueLogicFunctionJobs({
          logicFunctionUniversalIdentifier:
            CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
          payloads: [{}],
        });
      }

      return result;
    } catch (error) {
      throw buildRetryableStepFailure(
        'scheduled Recall bot cancellation',
        error,
      );
    }
  };

export default defineLogicFunction({
  universalIdentifier:
    CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cancel-scheduled-recall-bots',
  description:
    'Deletes the Recall bots of canceled recording requests in bounded slices, re-enqueueing itself while more remain. The daily cancellation retry stays the backstop.',
  timeoutSeconds: 900,
  handler: cancelScheduledRecallBotsHandler,
});
