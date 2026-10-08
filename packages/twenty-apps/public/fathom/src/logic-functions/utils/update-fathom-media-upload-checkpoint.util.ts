import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type FathomMediaUploadCheckpoint } from 'src/logic-functions/types/fathom-media-upload-checkpoint.type';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { updateFathomRecordingImport } from 'src/logic-functions/utils/update-fathom-recording-import.util';

export const updateFathomMediaUploadCheckpoint = async ({
  coreApiClient,
  uploadCheckpoint,
  writeContext,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  uploadCheckpoint: FathomMediaUploadCheckpoint | null;
  writeContext: FathomMediaWriteContext;
}): Promise<boolean> =>
  updateFathomRecordingImport({
    coreApiClient,
    writeContext,
    fields: { mediaUploadCheckpoint: uploadCheckpoint },
  });
