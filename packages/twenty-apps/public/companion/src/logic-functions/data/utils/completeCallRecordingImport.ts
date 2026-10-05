import { type CoreApiClient } from 'twenty-client-sdk/core';
import { CallRecordingStatus } from 'src/logic-functions/constants/CallRecordingStatus';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/NON_TERMINAL_CALL_RECORDING_STATUSES';

export const completeCallRecordingImport = async (
  client: Pick<CoreApiClient, 'mutation'>,
  { id }: { id: string },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: id },
          status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
        },
        data: {
          status: CallRecordingStatus.COMPLETED,
        },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
