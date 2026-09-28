import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

// Compare-and-set on the attempt markers: of concurrent runs that read the same
// pending row, only the one whose write still finds the markers it read goes
// on to create a bot, so their different attempt keys cannot create twins.
export const recordBotScheduleAttempt = async (
  client: CoreApiClient,
  {
    id,
    expectedAttemptedAt,
    attemptedAt,
    idempotencyKey,
  }: {
    id: string;
    expectedAttemptedAt: string | undefined;
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
          externalBotId: { is: 'NULL' },
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
