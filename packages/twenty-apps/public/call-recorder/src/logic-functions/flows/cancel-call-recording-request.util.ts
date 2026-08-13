import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { clearCallRecordingBotOwnership } from 'src/logic-functions/data/clear-call-recording-bot-ownership.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

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
      `[call-recorder] failed to cancel Recall bot for callRecording ${callRecording.id}, leaving ownership unresolved for retry: ${cancelResult.errorMessage}`,
    );

    return;
  }

  await clearCallRecordingBotOwnership(client, {
    callRecordingId: callRecording.id,
    expectedExternalBotId: callRecording.externalBotId,
    expectedBotScheduleIdempotencyKey: callRecording.botScheduleIdempotencyKey,
  });
};
