import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';

export const completeCallRecordingImport = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: id },
          status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
        },
        data: { status: CallRecordingStatus.COMPLETED },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
