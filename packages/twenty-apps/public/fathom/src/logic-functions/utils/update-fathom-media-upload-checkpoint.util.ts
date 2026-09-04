import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type FathomMediaUploadCheckpoint } from 'src/logic-functions/types/fathom-media-upload-checkpoint.type';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { updateCallRecordingMedia } from 'src/logic-functions/utils/update-call-recording-media.util';

export const updateFathomMediaUploadCheckpoint = async ({
  coreApiClient,
  callRecordingId,
  uploadCheckpoint,
  writeContext,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  uploadCheckpoint: FathomMediaUploadCheckpoint | null;
  writeContext: FathomMediaWriteContext;
}): Promise<boolean> =>
  updateCallRecordingMedia({
    coreApiClient,
    callRecordingId,
    writeContext,
    fields: { fathomMediaUploadCheckpoint: uploadCheckpoint },
  });
