import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateUnclaimedScheduledCallRecording } from 'src/logic-functions/data/update-unclaimed-scheduled-call-recording.util';

export const claimCallRecordingBotScheduleAttempt = async (
  client: CoreApiClient,
  {
    callRecordingId,
    expectedBotScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey,
    botScheduleAttemptedAt,
    botScheduleIdempotencyKey,
  }: {
    callRecordingId: string;
    expectedBotScheduleAttemptedAt: string | undefined;
    expectedBotScheduleIdempotencyKey: string | undefined;
    botScheduleAttemptedAt: string;
    botScheduleIdempotencyKey: string;
  },
): Promise<boolean> => {
  return updateUnclaimedScheduledCallRecording(client, {
    callRecordingId,
    expectedBotScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey,
    data: {
      botScheduleAttemptedAt,
      botScheduleIdempotencyKey,
    },
  });
};
