import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateCallRecordingMedia } from 'src/logic-functions/utils/update-call-recording-media.util';

// Recording why the media never arrived is what lets an automatic re-sync skip
// the work instead of asking Fathom to generate the same file again.
export const recordFathomMediaFailure = async ({
  coreApiClient,
  callRecordingId,
  reason,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  reason: string;
}): Promise<void> => {
  await updateCallRecordingMedia({
    coreApiClient,
    callRecordingId,
    fields: { fathomMediaFailureReason: reason },
  });
};
