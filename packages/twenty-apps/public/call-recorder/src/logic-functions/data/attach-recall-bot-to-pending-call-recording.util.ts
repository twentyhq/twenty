import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const attachRecallBotToPendingCallRecording = async (
  client: CoreApiClient,
  {
    id,
    externalBotId,
  }: {
    id: string;
    externalBotId: string;
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
        },
        data: { externalBotId },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
