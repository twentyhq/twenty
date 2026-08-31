import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

// Compare-and-set on the row state the caller read, so at most one writer's
// Recall POST can follow.
export const claimCallRecordingBotSchedule = async (
  client: CoreApiClient,
  {
    id,
    expectedBotScheduleIdempotencyKey,
    botScheduleAttemptedAt,
    botScheduleIdempotencyKey,
  }: {
    id: string;
    expectedBotScheduleIdempotencyKey: string | undefined;
    botScheduleAttemptedAt: string;
    botScheduleIdempotencyKey: string;
  },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: id },
          deletedAt: { is: 'NULL' },
          recordingRequestStatus: {
            eq: CallRecordingRequestStatus.REQUESTED,
          },
          status: { eq: CallRecordingStatus.SCHEDULED },
          externalBotId: { is: 'NULL' },
          botScheduleIdempotencyKey:
            expectedBotScheduleIdempotencyKey === undefined
              ? { is: 'NULL' }
              : { eq: expectedBotScheduleIdempotencyKey },
        },
        data: {
          botScheduleAttemptedAt,
          botScheduleIdempotencyKey,
        },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
