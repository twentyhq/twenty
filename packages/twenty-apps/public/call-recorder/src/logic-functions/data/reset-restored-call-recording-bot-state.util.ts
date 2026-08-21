import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { getCallRecordingBotScheduleAttemptMutationFields } from 'src/logic-functions/data/get-call-recording-bot-schedule-attempt-mutation-fields.util';
import { type CallRecordingBotScheduleAttempt } from 'src/logic-functions/domain/call-recording-bot-schedule-attempt';

export const resetRestoredCallRecordingBotState = async (
  coreApiClient: CoreApiClient,
  {
    callRecordingId,
    status,
    recordingRequestStatus,
    externalBotId,
    botScheduleAttempt,
  }: {
    callRecordingId: string;
    status: string;
    recordingRequestStatus: string | undefined;
    externalBotId: string | undefined;
    botScheduleAttempt: CallRecordingBotScheduleAttempt | undefined;
  },
): Promise<boolean> => {
  const attemptFields =
    getCallRecordingBotScheduleAttemptMutationFields(botScheduleAttempt);
  const emptyAttemptFields =
    getCallRecordingBotScheduleAttemptMutationFields(undefined);

  const resetBotStateMutationResult = await coreApiClient.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          deletedAt: { is: 'NULL' },
          recordingRequestStatus: isUndefined(recordingRequestStatus)
            ? { is: 'NULL' }
            : { eq: recordingRequestStatus },
          externalBotId: isUndefined(externalBotId)
            ? { is: 'NULL' }
            : { eq: externalBotId },
          ...attemptFields.filter,
        },
        data: {
          externalBotId: null,
          ...emptyAttemptFields.data,
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

  return (resetBotStateMutationResult.updateCallRecordings ?? []).length > 0;
};
