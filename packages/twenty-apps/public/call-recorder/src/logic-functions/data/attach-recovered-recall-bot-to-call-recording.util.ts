import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

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
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          deletedAt: { is: 'NULL' },
          recordingRequestStatus: {
            eq: CallRecordingRequestStatus.REQUESTED,
          },
          status: { eq: CallRecordingStatus.SCHEDULED },
          externalBotId: { is: 'NULL' },
          botScheduleAttemptedAt: isUndefined(expectedBotScheduleAttemptedAt)
            ? { is: 'NULL' }
            : { eq: expectedBotScheduleAttemptedAt },
          botScheduleIdempotencyKey: isUndefined(
            expectedBotScheduleIdempotencyKey,
          )
            ? { is: 'NULL' }
            : { eq: expectedBotScheduleIdempotencyKey },
        },
        data: { externalBotId },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
