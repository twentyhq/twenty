import { type CoreApiClient } from 'twenty-client-sdk/core';

import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';

export const clearCanceledRecallBot = async (
  client: CoreApiClient,
  {
    callRecordingId,
    externalBotId,
  }: {
    callRecordingId: string;
    externalBotId: string;
  },
): Promise<void> => {
  await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
          externalBotId: { eq: externalBotId },
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
};
