import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

export const deferCallRecordingArtifactReconciliation = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<void> => {
  // Refresh updatedAt without changing call state so oldest-first artifact batches keep moving.
  await updateCallRecording(client, {
    id,
    data: {
      recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
    },
  });
};
