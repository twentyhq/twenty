import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const recordCallRecordingBotScheduleAttemptIfActive = async (
  client: CoreApiClient,
  {
    callRecordingId,
    botScheduleAttemptedAt,
    botScheduleIdempotencyKey,
  }: {
    callRecordingId: string;
    botScheduleAttemptedAt: string;
    botScheduleIdempotencyKey: string;
  },
): Promise<boolean> => {
  const scheduleAttemptMutationResult = await client.mutation({
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
        },
        data: {
          botScheduleAttemptedAt,
          botScheduleIdempotencyKey,
        },
      },
      id: true,
    },
  });

  return (scheduleAttemptMutationResult.updateCallRecordings ?? []).length > 0;
};
