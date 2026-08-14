import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateUnclaimedCallRecordingBotScheduleAttempt } from 'src/logic-functions/data/update-unclaimed-call-recording-bot-schedule-attempt.util';

export const attachRecoveredRecallBotToCallRecording = async (
  client: CoreApiClient,
  {
    callRecordingId,
    externalBotId,
    expectedBotScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey,
  }: {
    callRecordingId: string;
    externalBotId: string;
    expectedBotScheduleAttemptedAt: string | undefined;
    expectedBotScheduleIdempotencyKey: string | undefined;
  },
): Promise<boolean> => {
  return updateUnclaimedCallRecordingBotScheduleAttempt(client, {
    callRecordingId,
    expectedBotScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey,
    data: { externalBotId },
  });
};
