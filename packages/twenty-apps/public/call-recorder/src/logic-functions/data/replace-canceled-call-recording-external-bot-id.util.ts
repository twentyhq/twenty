import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';

export const replaceCanceledCallRecordingExternalBotId = async (
  client: CoreApiClient,
  {
    id,
    expectedBotScheduleAttemptId,
    expectedExternalBotId,
    nextExternalBotId,
  }: {
    id: string;
    expectedBotScheduleAttemptId: string | undefined;
    expectedExternalBotId: string | null;
    nextExternalBotId: string | null;
  },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: id },
          recordingRequestStatus: {
            eq: CallRecordingRequestStatus.CANCELED,
          },
          status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
          botScheduleAttemptId: isUndefined(expectedBotScheduleAttemptId)
            ? { is: 'NULL' }
            : { eq: expectedBotScheduleAttemptId },
          externalBotId:
            expectedExternalBotId === null
              ? { is: 'NULL' }
              : { eq: expectedExternalBotId },
        },
        data: { externalBotId: nextExternalBotId },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
