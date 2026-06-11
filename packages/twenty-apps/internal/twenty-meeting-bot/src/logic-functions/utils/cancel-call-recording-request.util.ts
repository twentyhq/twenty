import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { cancelRecallRecordingBot } from 'src/logic-functions/utils/cancel-recall-recording-bot.util';
import { updateCallRecording } from 'src/logic-functions/utils/update-call-recording.util';

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

  if (!isNonEmptyString(callRecording.externalBotId)) {
    return;
  }

  const cancelResult = await cancelRecallRecordingBot({
    externalBotId: callRecording.externalBotId,
  });

  if (!cancelResult.ok) {
    console.warn(
      `[recall-recording-bot] failed to cancel Recall bot for callRecording ${callRecording.id}, leaving it for the stale-state cron: ${cancelResult.errorMessage}`,
    );

    return;
  }

  await updateCallRecording(client, {
    id: callRecording.id,
    data: {
      externalBotId: null,
    },
  });
};
