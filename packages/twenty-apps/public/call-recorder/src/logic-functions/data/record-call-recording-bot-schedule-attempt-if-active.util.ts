import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { getCallRecordingBotScheduleAttemptMutationFields } from 'src/logic-functions/data/get-call-recording-bot-schedule-attempt-mutation-fields.util';
import {
  type CallRecordingBotScheduleAttempt,
  type CompleteCallRecordingBotScheduleAttempt,
} from 'src/logic-functions/domain/call-recording-bot-schedule-attempt';

export const recordCallRecordingBotScheduleAttemptIfActive = async (
  coreApiClient: CoreApiClient,
  {
    callRecordingId,
    expectedAttempt,
    nextAttempt,
  }: {
    callRecordingId: string;
    expectedAttempt: CallRecordingBotScheduleAttempt | undefined;
    nextAttempt: CompleteCallRecordingBotScheduleAttempt;
  },
): Promise<boolean> => {
  const expectedAttemptFields =
    getCallRecordingBotScheduleAttemptMutationFields(expectedAttempt);
  const nextAttemptFields =
    getCallRecordingBotScheduleAttemptMutationFields(nextAttempt);

  const scheduleAttemptMutationResult = await coreApiClient.mutation({
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
        data: nextAttemptFields.data,
      },
      id: true,
    },
  });

  return (scheduleAttemptMutationResult.updateCallRecordings ?? []).length > 0;
};
