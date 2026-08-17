import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const updateCallRecordingForRecallWebhookIfOwned = async (
  coreApiClient: CoreApiClient,
  {
    callRecordingId,
    expectedStatus,
    expectedExternalBotId,
    expectedBotScheduleAttemptId,
    data,
  }: {
    callRecordingId: string;
    expectedStatus: string | undefined;
    expectedExternalBotId: string | undefined;
    expectedBotScheduleAttemptId: string | undefined;
    data: CallRecordingUpdateFields;
  },
): Promise<boolean> => {
  const webhookMutationResult = await coreApiClient.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          deletedAt: { is: 'NULL' },
          status: isUndefined(expectedStatus)
            ? { is: 'NULL' }
            : { eq: expectedStatus },
          externalBotId: isUndefined(expectedExternalBotId)
            ? { is: 'NULL' }
            : { eq: expectedExternalBotId },
          botScheduleAttemptId: isUndefined(expectedBotScheduleAttemptId)
            ? { is: 'NULL' }
            : { eq: expectedBotScheduleAttemptId },
        },
        data,
      },
      id: true,
    },
  });

  return (webhookMutationResult.updateCallRecordings ?? []).length > 0;
};
