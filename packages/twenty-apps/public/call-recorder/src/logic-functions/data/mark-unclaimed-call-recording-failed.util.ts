import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { updateUnclaimedScheduledCallRecording } from 'src/logic-functions/data/update-unclaimed-scheduled-call-recording.util';

export const markUnclaimedCallRecordingFailed = async (
  client: CoreApiClient,
  {
    callRecordingId,
    expectedBotScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey,
    failureReason,
  }: {
    callRecordingId: string;
    expectedBotScheduleAttemptedAt: string | undefined;
    expectedBotScheduleIdempotencyKey: string | undefined;
    failureReason: string;
  },
): Promise<boolean> => {
  return updateUnclaimedScheduledCallRecording(client, {
    callRecordingId,
    expectedBotScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey,
    data: {
      status: CallRecordingStatus.FAILED,
      callRecorderFailureReason: failureReason,
    },
  });
};
