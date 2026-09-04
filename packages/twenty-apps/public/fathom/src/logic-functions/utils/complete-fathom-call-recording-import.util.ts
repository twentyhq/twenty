import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { findCallRecordingMediaState } from 'src/logic-functions/utils/find-call-recording-media-state.util';
import { isFathomCallRecordingImportComplete } from 'src/logic-functions/utils/is-fathom-call-recording-import-complete.util';

export const completeFathomCallRecordingImport = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
}): Promise<boolean> => {
  const callRecording = await findCallRecordingMediaState({
    coreApiClient,
    callRecordingId,
  });

  if (
    !isDefined(callRecording) ||
    !isFathomCallRecordingImportComplete(callRecording)
  ) {
    return false;
  }

  const mutationResult = await coreApiClient.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          updatedAt: { eq: callRecording.updatedAt },
          status: { eq: 'PROCESSING' },
        },
        data: { status: 'COMPLETED' },
      },
      id: true,
    },
  });

  return (mutationResult.updateCallRecordings ?? []).length > 0;
};
