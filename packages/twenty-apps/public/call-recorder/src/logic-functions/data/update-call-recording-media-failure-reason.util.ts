import { type CoreApiClient } from 'twenty-client-sdk/core';

import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';

export const updateCallRecordingMediaFailureReason = async (
  client: CoreApiClient,
  {
    callRecordingId,
    failureReason,
  }: { callRecordingId: string; failureReason: string },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
        },
        data: { callRecorderFailureReason: failureReason },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
