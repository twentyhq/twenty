import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateUnclaimedCallRecordingBotScheduleAttempt } from 'src/logic-functions/data/update-unclaimed-call-recording-bot-schedule-attempt.util';

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
  return updateUnclaimedCallRecordingBotScheduleAttempt(client, {
    callRecordingId,
    expectedBotScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey,
    data: {
      botScheduleAttemptedAt,
      botScheduleIdempotencyKey,
    },
  });
};
