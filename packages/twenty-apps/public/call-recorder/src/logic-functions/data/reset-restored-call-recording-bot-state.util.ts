import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const resetRestoredCallRecordingBotState = async (
  client: CoreApiClient,
  {
    id,
    status,
    recordingRequestStatus,
    externalBotId,
    botScheduleAttemptedAt,
    botScheduleIdempotencyKey,
  }: {
    id: string;
    status: string;
    recordingRequestStatus: string | undefined;
    externalBotId: string | undefined;
    botScheduleAttemptedAt: string | undefined;
    botScheduleIdempotencyKey: string | undefined;
  },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: id },
          deletedAt: { is: 'NULL' },
          status: { eq: status },
          recordingRequestStatus: isUndefined(recordingRequestStatus)
            ? { is: 'NULL' }
            : { eq: recordingRequestStatus },
          externalBotId: isUndefined(externalBotId)
            ? { is: 'NULL' }
            : { eq: externalBotId },
          botScheduleAttemptedAt: isUndefined(botScheduleAttemptedAt)
            ? { is: 'NULL' }
            : { eq: botScheduleAttemptedAt },
          botScheduleIdempotencyKey: isUndefined(botScheduleIdempotencyKey)
            ? { is: 'NULL' }
            : { eq: botScheduleIdempotencyKey },
        },
        data: {
          externalBotId: null,
          botScheduleAttemptedAt: null,
          botScheduleIdempotencyKey: null,
          ...(recordingRequestStatus ===
            CallRecordingRequestStatus.REQUESTED &&
          status !== CallRecordingStatus.FAILED
            ? { status: CallRecordingStatus.SCHEDULED }
            : {}),
        },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
