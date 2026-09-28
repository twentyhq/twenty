import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';

export const replaceCanceledCallRecordingExternalBotId = async (
  client: CoreApiClient,
  {
    id,
    expectedExternalBotId,
    nextExternalBotId,
  }: {
    id: string;
    expectedExternalBotId: string | null;
    nextExternalBotId: string | null;
  },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: id },
          // Clearing follows a confirmed cancel, so the bot is gone and even a
          // row re-requested meanwhile must drop it; only claiming a recovered
          // bot is limited to canceled rows.
          ...(nextExternalBotId === null
            ? {}
            : {
                recordingRequestStatus: {
                  eq: CallRecordingRequestStatus.CANCELED,
                },
              }),
          status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
          externalBotId:
            expectedExternalBotId === null
              ? { is: 'NULL' }
              : { eq: expectedExternalBotId },
        },
        // A confirmed cancel resolves the creation attempt, so a later
        // re-request schedules a new bot at once instead of waiting for the
        // recovery cron's Recall lookup.
        data:
          nextExternalBotId === null
            ? {
                externalBotId: null,
                botScheduleAttemptedAt: null,
                botScheduleIdempotencyKey: null,
              }
            : { externalBotId: nextExternalBotId },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
