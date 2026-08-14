import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateUnclaimedScheduledCallRecording } from 'src/logic-functions/data/update-unclaimed-scheduled-call-recording.util';

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
  return updateUnclaimedScheduledCallRecording(client, {
    callRecordingId,
    expectedBotScheduleAttemptedAt: botScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey: botScheduleIdempotencyKey,
    data: { externalBotId },
  });
};
