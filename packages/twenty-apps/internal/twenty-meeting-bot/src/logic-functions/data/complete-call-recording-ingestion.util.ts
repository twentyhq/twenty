import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const completeCallRecordingIngestion = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: id },
          status: { neq: CallRecordingStatus.COMPLETED },
        },
        data: { status: CallRecordingStatus.COMPLETED },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
