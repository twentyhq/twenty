import { setTimeout } from 'node:timers/promises';

import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { updateFathomRecordingImport } from 'src/logic-functions/utils/update-fathom-recording-import.util';

const MAX_DOWNLOAD_ID_SAVE_ATTEMPTS = 3;
const DOWNLOAD_ID_SAVE_RETRY_DELAY_MILLISECONDS = 500;

export const updateFathomMediaDownloadId = async ({
  coreApiClient,
  downloadId,
  writeContext,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  downloadId: string | null;
  writeContext: FathomMediaWriteContext;
}): Promise<boolean> => {
  const saveDownloadId = () =>
    updateFathomRecordingImport({
      coreApiClient,
      writeContext,
      fields: {
        mediaDownloadId: downloadId,
        mediaUploadCheckpoint: null,
      },
    });

  for (let attempt = 1; attempt < MAX_DOWNLOAD_ID_SAVE_ATTEMPTS; attempt++) {
    try {
      return await saveDownloadId();
    } catch {
      await setTimeout(DOWNLOAD_ID_SAVE_RETRY_DELAY_MILLISECONDS * attempt);
    }
  }

  return saveDownloadId();
};
