import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const recordBotScheduleAttempt = async (
  client: CoreApiClient,
  {
    id,
    expectedAttemptedAt,
    expectedExternalBotId,
    attemptedAt,
    idempotencyKey,
  }: {
    id: string;
    expectedAttemptedAt: string | undefined;
    // The bot this attempt replaces; a pending row carries none.
    expectedExternalBotId?: string;
    attemptedAt: string;
    idempotencyKey: string;
  },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: id },
          recordingRequestStatus: {
            eq: CallRecordingRequestStatus.REQUESTED,
          },
          status: { in: [CallRecordingStatus.SCHEDULED] },
          externalBotId: isUndefined(expectedExternalBotId)
            ? { is: 'NULL' }
            : { eq: expectedExternalBotId },
          botScheduleAttemptedAt: isUndefined(expectedAttemptedAt)
            ? { is: 'NULL' }
            : { eq: expectedAttemptedAt },
        },
        data: {
          botScheduleAttemptedAt: attemptedAt,
          botScheduleIdempotencyKey: idempotencyKey,
        },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
