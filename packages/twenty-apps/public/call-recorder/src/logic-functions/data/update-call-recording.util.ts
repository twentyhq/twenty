import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const updateCallRecording = async (
  client: CoreApiClient,
  {
    id,
    data,
  }: {
    id: string;
    data: CallRecordingUpdateFields;
  },
): Promise<void> => {
  await client.mutation({
    updateCallRecording: {
      __args: {
        id,
        data,
      },
      id: true,
    },
  });
};
