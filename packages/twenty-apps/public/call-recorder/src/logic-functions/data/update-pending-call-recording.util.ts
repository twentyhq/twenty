import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

// Writes only while the request still awaits a bot, so a cancellation or a
// webhook that landed in the meantime wins.
export const updatePendingCallRecording = async ({
  client,
  id,
  data,
}: {
  client: CoreApiClient;
  id: string;
  data: CallRecordingUpdateFields;
}): Promise<boolean> => {
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
        data,
      },
      id: true,
    },
  });

  return isNonEmptyArray(result.updateCallRecordings);
};
