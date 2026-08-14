import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateUnclaimedCallRecordingBotScheduleAttempt } from 'src/logic-functions/data/update-unclaimed-call-recording-bot-schedule-attempt.util';

export const attachRecallBotToCallRecording = async (
  client: CoreApiClient,
  {
    callRecordingId,
    externalBotId,
    botScheduleAttemptedAt,
    botScheduleIdempotencyKey,
  }: {
    callRecordingId: string;
    externalBotId: string;
    botScheduleAttemptedAt: string;
    botScheduleIdempotencyKey: string;
  },
): Promise<boolean> => {
  return updateUnclaimedCallRecordingBotScheduleAttempt(client, {
    callRecordingId,
    expectedBotScheduleAttemptedAt: botScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey: botScheduleIdempotencyKey,
    data: { externalBotId },
  });
};
