import { type CoreApiClient } from 'twenty-client-sdk/core';

import { GOOGLE_MEET_RECORDING_FILE_NAME } from 'src/logic-functions/constants/google-meet-recording-import.constant';

export const saveCallRecordingVideo = async ({
  coreApiClient,
  callRecordingId,
  fileId,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  fileId: string;
}): Promise<void> => {
  await coreApiClient.mutation({
    updateCallRecording: {
      __args: {
        id: callRecordingId,
        data: { video: [{ fileId, label: GOOGLE_MEET_RECORDING_FILE_NAME }] },
      },
      id: true,
    },
  });
};
