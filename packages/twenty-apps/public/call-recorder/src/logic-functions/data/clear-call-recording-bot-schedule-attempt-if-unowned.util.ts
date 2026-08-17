import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { getCallRecordingBotScheduleAttemptMutationFields } from 'src/logic-functions/data/get-call-recording-bot-schedule-attempt-mutation-fields.util';
import { type CallRecordingBotScheduleAttempt } from 'src/logic-functions/domain/call-recording-bot-schedule-attempt';

export const clearCallRecordingBotScheduleAttemptIfUnowned = async (
  coreApiClient: CoreApiClient,
  {
    callRecordingId,
    expectedAttempt,
  }: {
    callRecordingId: string;
    expectedAttempt: CallRecordingBotScheduleAttempt | undefined;
  },
): Promise<boolean> => {
  const expectedAttemptFields =
    getCallRecordingBotScheduleAttemptMutationFields(expectedAttempt);
  const emptyAttemptFields =
    getCallRecordingBotScheduleAttemptMutationFields(undefined);

  const clearAttemptMutationResult = await coreApiClient.mutation({
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
          ...expectedAttemptFields.filter,
        },
        data: emptyAttemptFields.data,
      },
      id: true,
    },
  });

  return (clearAttemptMutationResult.updateCallRecordings ?? []).length > 0;
};
