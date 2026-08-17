import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const clearCallRecordingBotScheduleAttemptIfUnowned = async (
  coreApiClient: CoreApiClient,
  {
    callRecordingId,
    expectedBotScheduleAttemptId,
    expectedBotScheduleAttemptedAt,
    expectedBotScheduleIdempotencyKey,
  }: {
    callRecordingId: string;
    expectedBotScheduleAttemptId: string | undefined;
    expectedBotScheduleAttemptedAt: string | undefined;
    expectedBotScheduleIdempotencyKey: string | undefined;
  },
): Promise<boolean> => {
  const clearAttemptMutationResult = await coreApiClient.mutation({
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
          botScheduleAttemptId: isUndefined(expectedBotScheduleAttemptId)
            ? { is: 'NULL' }
            : { eq: expectedBotScheduleAttemptId },
          botScheduleAttemptedAt: isUndefined(expectedBotScheduleAttemptedAt)
            ? { is: 'NULL' }
            : { eq: expectedBotScheduleAttemptedAt },
          botScheduleIdempotencyKey: isUndefined(
            expectedBotScheduleIdempotencyKey,
          )
            ? { is: 'NULL' }
            : { eq: expectedBotScheduleIdempotencyKey },
        },
        data: {
          botScheduleAttemptId: null,
          botScheduleAttemptedAt: null,
          botScheduleIdempotencyKey: null,
        },
      },
      id: true,
    },
  });

  return (clearAttemptMutationResult.updateCallRecordings ?? []).length > 0;
};
