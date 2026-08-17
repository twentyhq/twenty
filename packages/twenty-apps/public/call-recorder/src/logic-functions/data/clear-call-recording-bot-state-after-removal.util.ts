import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { getCallRecordingBotScheduleAttemptMutationFields } from 'src/logic-functions/data/get-call-recording-bot-schedule-attempt-mutation-fields.util';
import { type CallRecordingBotScheduleAttempt } from 'src/logic-functions/domain/call-recording-bot-schedule-attempt';

export const clearCallRecordingBotStateAfterRemoval = async (
  coreApiClient: CoreApiClient,
  {
    callRecordingId,
    externalBotId,
    botScheduleAttempt,
  }: {
    callRecordingId: string;
    externalBotId: string | undefined;
    botScheduleAttempt: CallRecordingBotScheduleAttempt | undefined;
  },
): Promise<void> => {
  const expectedAttemptFields =
    getCallRecordingBotScheduleAttemptMutationFields(botScheduleAttempt);
  const emptyAttemptFields =
    getCallRecordingBotScheduleAttemptMutationFields(undefined);

  await coreApiClient.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          // Mentioning deletedAt opts the mutation into soft-deleted rows; the
          // two exhaustive branches also let this ownership CAS finish if the
          // recording is restored between remote removal and this write.
          or: [
            { deletedAt: { is: 'NULL' } },
            { deletedAt: { is: 'NOT_NULL' } },
          ],
          externalBotId: isUndefined(externalBotId)
            ? { is: 'NULL' }
            : { eq: externalBotId },
          ...expectedAttemptFields.filter,
        },
        data: {
          externalBotId: null,
          ...emptyAttemptFields.data,
        },
      },
      id: true,
    },
  });
};
