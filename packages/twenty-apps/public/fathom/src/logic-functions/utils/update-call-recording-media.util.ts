import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';

// Media lands long after the transcript upsert, so this writes only the media
// fields and never recreates a CallRecording the workspace has since deleted.
export const updateCallRecordingMedia = async ({
  coreApiClient,
  callRecordingId,
  fields,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  fields: Pick<CallRecordingSyncFields, 'video' | 'audio'>;
}): Promise<void> => {
  await coreApiClient.mutation({
    updateCallRecording: {
      __args: {
        id: callRecordingId,
        data: fields,
      },
      id: true,
    },
  });
};
