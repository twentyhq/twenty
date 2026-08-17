import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';

export const recordCallRecordingExternalBotIdForScheduleAttempt = async (
  coreApiClient: CoreApiClient,
  {
    callRecordingId,
    botScheduleAttemptId,
    externalBotId,
  }: {
    callRecordingId: string;
    botScheduleAttemptId: string | undefined;
    externalBotId: string;
  },
): Promise<boolean> => {
  const externalBotIdMutationResult = await coreApiClient.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          deletedAt: { is: 'NULL' },
          recordingRequestStatus: {
            eq: CallRecordingRequestStatus.REQUESTED,
          },
          externalBotId: { is: 'NULL' },
          botScheduleAttemptId: isUndefined(botScheduleAttemptId)
            ? { is: 'NULL' }
            : { eq: botScheduleAttemptId },
        },
        data: { externalBotId },
      },
      id: true,
    },
  });

  return (externalBotIdMutationResult.updateCallRecordings ?? []).length > 0;
};
