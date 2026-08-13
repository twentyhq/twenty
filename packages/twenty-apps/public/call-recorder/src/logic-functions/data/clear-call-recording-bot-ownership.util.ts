import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

export const clearCallRecordingBotOwnership = async (
  client: CoreApiClient,
  {
    callRecordingId,
    expectedExternalBotId,
    expectedBotScheduleIdempotencyKey,
  }: {
    callRecordingId: string;
    expectedExternalBotId: string | null;
    expectedBotScheduleIdempotencyKey: string | undefined;
  },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          externalBotId:
            expectedExternalBotId === null
              ? { is: 'NULL' }
              : { eq: expectedExternalBotId },
          botScheduleIdempotencyKey: isUndefined(
            expectedBotScheduleIdempotencyKey,
          )
            ? { is: 'NULL' }
            : { eq: expectedBotScheduleIdempotencyKey },
        },
        data: {
          externalBotId: null,
          botScheduleAttemptedAt: null,
          botScheduleIdempotencyKey: null,
        },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
