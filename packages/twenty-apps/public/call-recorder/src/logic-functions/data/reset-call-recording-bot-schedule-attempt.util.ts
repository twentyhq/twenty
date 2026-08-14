import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateUnclaimedCallRecordingBotScheduleAttempt } from 'src/logic-functions/data/update-unclaimed-call-recording-bot-schedule-attempt.util';

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
  return updateUnclaimedCallRecordingBotScheduleAttempt(client, {
    callRecordingId,
    expectedBotScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey,
    data: {
      botScheduleAttemptedAt: null,
      botScheduleIdempotencyKey: null,
    },
  });
};
