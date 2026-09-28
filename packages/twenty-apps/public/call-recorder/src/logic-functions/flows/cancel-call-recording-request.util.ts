import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { replaceCanceledCallRecordingExternalBotId } from 'src/logic-functions/data/replace-canceled-call-recording-external-bot-id.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

// Intent-first: the stale-state cron finishes the Recall half when this call fails.
export const cancelCallRecordingRequest = async ({
  client,
  callRecording,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
}): Promise<void> => {
  await updateCallRecording(client, {
    id: callRecording.id,
    data: {
      recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
    },
  });

  if (isUndefined(callRecording.externalBotId)) {
    return;
  }

  const cancelResult = await cancelRecallBot({
    externalBotId: callRecording.externalBotId,
  });

  if (!cancelResult.ok) {
    console.warn(
      `[call-recorder] failed to cancel Recall bot for callRecording ${callRecording.id}, leaving it for the stale-state cron: ${cancelResult.errorMessage}`,
    );

    return;
  }

  // Conditional on the row still pointing at this bot, so a re-request that
  // already scheduled a new bot while Recall processed the cancel keeps it.
  await replaceCanceledCallRecordingExternalBotId(client, {
    id: callRecording.id,
    expectedExternalBotId: callRecording.externalBotId,
    nextExternalBotId: null,
  });
};
