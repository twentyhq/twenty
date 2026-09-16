import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { convergeDivergedCallRecordings } from 'src/logic-functions/flows/converge-diverged-call-recordings.util';
import { reconcileCallRecording } from 'src/logic-functions/flows/reconcile-call-recording.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const reconcileStaleBotStateHandler = async (
  payload: unknown,
): Promise<object> => {
  const body = asRecord(payload);
  const callRecordingId = getString(body?.callRecordingId);
  const client = new CoreApiClient();

  try {
    if (!isUndefined(callRecordingId)) {
      await reconcileCallRecording({ client, callRecordingId });
      return { callRecordingId };
    }

    return {
      statusConvergenceResult: await convergeDivergedCallRecordings({
        client,
        now: new Date(),
        after: getString(body?.after),
      }),
    };
  } catch (error) {
    throw buildRetryableStepFailure('call recording recovery', error);
  }
};

export default defineLogicFunction({
  universalIdentifier: STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-stale-bot-state',
  description:
    'Enqueues missing artifact imports and reconciles recording lifecycle state when Recall webhooks are missed.',
  timeoutSeconds: 250,
  handler: reconcileStaleBotStateHandler,
});
