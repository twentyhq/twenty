import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { completeFathomCallRecordingImport } from 'src/logic-functions/utils/complete-fathom-call-recording-import.util';
import { updateCallRecordingMedia } from 'src/logic-functions/utils/update-call-recording-media.util';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';

export const settleCallRecordingMedia = async ({
  coreApiClient,
  callRecordingId,
  fields,
  writeContext,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
  writeContext: FathomMediaWriteContext;
  fields: Pick<
    CallRecordingSyncFields,
    'video' | 'audio' | 'fathomMediaFailureReason'
  >;
}): Promise<boolean> => {
  const isApplied = await updateCallRecordingMedia({
    coreApiClient,
    callRecordingId,
    writeContext,
    fields: {
      ...fields,
      fathomMediaDownloadId: null,
      fathomMediaUploadCheckpoint: null,
    },
  });

  if (!isApplied) {
    return false;
  }

  await completeFathomCallRecordingImport({
    coreApiClient,
    callRecordingId,
  });

  return true;
};
