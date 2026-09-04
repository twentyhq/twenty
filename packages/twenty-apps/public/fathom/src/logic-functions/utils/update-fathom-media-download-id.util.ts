import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { updateCallRecordingMedia } from 'src/logic-functions/utils/update-call-recording-media.util';

export const updateFathomMediaDownloadId = async ({
  coreApiClient,
  callRecordingId,
  downloadId,
  writeContext,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  downloadId: string | null;
  writeContext: FathomMediaWriteContext;
}): Promise<boolean> =>
  updateCallRecordingMedia({
    coreApiClient,
    callRecordingId,
    writeContext,
    fields: {
      fathomMediaDownloadId: downloadId,
      fathomMediaUploadCheckpoint: null,
    },
  });
