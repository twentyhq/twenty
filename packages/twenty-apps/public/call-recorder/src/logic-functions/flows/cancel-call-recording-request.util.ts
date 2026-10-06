import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { clearCanceledRecallBot } from 'src/logic-functions/data/clear-canceled-recall-bot.util';
import { enqueueCallRecordingRequestFollowUps } from 'src/logic-functions/data/enqueue-call-recording-request-follow-ups.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

// A queue outage must not prevent cancellation; the snapshot can predate an in-flight booking.
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

  try {
    if (isUndefined(callRecording.externalBotId)) {
      return;
    }

    const cancelResult = await cancelRecallBot({
      externalBotId: callRecording.externalBotId,
    });

    if (!cancelResult.ok) {
      console.warn(
        `[call-recorder] failed to cancel Recall bot for callRecording ${callRecording.id}, leaving it for the follow-up: ${cancelResult.errorMessage}`,
      );

      return;
    }

    await clearCanceledRecallBot(client, {
      callRecordingId: callRecording.id,
      externalBotId: callRecording.externalBotId,
    });
  } finally {
    await enqueueCallRecordingRequestFollowUps({
      callRecordingIds: [callRecording.id],
    });
  }
};
