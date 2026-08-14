import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateUnclaimedScheduledCallRecording } from 'src/logic-functions/data/update-unclaimed-scheduled-call-recording.util';

export const resetCallRecordingBotScheduleAttempt = async (
  client: CoreApiClient,
  {
    callRecordingId,
    expectedBotScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey,
  }: {
    callRecordingId: string;
    expectedBotScheduleAttemptedAt: string | undefined;
    expectedBotScheduleIdempotencyKey: string | undefined;
  },
): Promise<boolean> => {
  return updateUnclaimedScheduledCallRecording(client, {
    callRecordingId,
    expectedBotScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey,
    data: {
      botScheduleAttemptedAt: null,
      botScheduleIdempotencyKey: null,
    },
  });
};
