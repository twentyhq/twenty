import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { updateFathomRecordingImport } from 'src/logic-functions/utils/update-fathom-recording-import.util';

export const updateFathomMediaDownloadId = async ({
  coreApiClient,
  downloadId,
  writeContext,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  downloadId: string | null;
  writeContext: FathomMediaWriteContext;
}): Promise<boolean> =>
  updateFathomRecordingImport({
    coreApiClient,
    writeContext,
    fields: {
      mediaDownloadId: downloadId,
      mediaUploadCheckpoint: null,
    },
  });
