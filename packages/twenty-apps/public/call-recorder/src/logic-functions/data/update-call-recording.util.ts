import { isUndefined } from '@sniptt/guards';
import { type CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const updateCallRecording = async (
  client: CoreApiClient,
  {
    id,
    data,
    expectedStatuses,
  }: {
    id: string;
    data: CallRecordingUpdateFields;
    expectedStatuses?: CallRecordingStatus[];
  },
): Promise<boolean> => {
  if (!isUndefined(expectedStatuses)) {
    const result = await client.mutation({
      updateCallRecordings: {
        __args: {
          filter: { id: { eq: id }, status: { in: expectedStatuses } },
          data,
        },
        id: true,
      },
    });
    return (result.updateCallRecordings ?? []).length > 0;
  }

  await client.mutation({
    updateCallRecording: {
      __args: {
        id,
        data,
      },
      id: true,
    },
  });
  return true;
};
