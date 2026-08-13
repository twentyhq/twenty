import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const attachRecallBotToCallRecording = async (
  client: CoreApiClient,
  {
    callRecordingId,
    externalBotId,
    botScheduleIdempotencyKey,
  }: {
    callRecordingId: string;
    externalBotId: string;
    botScheduleIdempotencyKey: string;
  },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          deletedAt: { is: 'NULL' },
          recordingRequestStatus: {
            eq: CallRecordingRequestStatus.REQUESTED,
          },
          status: { eq: CallRecordingStatus.SCHEDULED },
          externalBotId: { is: 'NULL' },
          botScheduleIdempotencyKey: { eq: botScheduleIdempotencyKey },
        },
        data: { externalBotId },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
