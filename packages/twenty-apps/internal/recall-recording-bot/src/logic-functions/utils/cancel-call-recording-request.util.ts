import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { cancelRecallRecordingBot } from 'src/logic-functions/utils/recall-bot-api.util';
import { updateCallRecording } from 'src/logic-functions/utils/update-call-recording.util';

export const cancelCallRecordingRequest = async ({
  client,
  callRecording,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
}): Promise<{ canceled: boolean }> => {
  if (isNonEmptyString(callRecording.externalBotId)) {
    const cancelResult = await cancelRecallRecordingBot({
      externalBotId: callRecording.externalBotId,
    });

    if (!cancelResult.ok) {
      console.warn(
        `[recall-recording-bot] failed to cancel Recall bot for callRecording ${callRecording.id}, keeping request open for retry: ${cancelResult.errorMessage}`,
      );

      return { canceled: false };
    }
  }

  await updateCallRecording(client, {
    id: callRecording.id,
    data: {
      recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
      externalBotId: null,
    },
  });

  return { canceled: true };
};
