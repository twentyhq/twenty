import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type FathomRecordingImportFields } from 'src/logic-functions/types/fathom-recording-import-fields.type';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { completeFathomCallRecordingImport } from 'src/logic-functions/utils/complete-fathom-call-recording-import.util';
import { updateCallRecordingMedia } from 'src/logic-functions/utils/update-call-recording-media.util';
import { updateFathomRecordingImport } from 'src/logic-functions/utils/update-fathom-recording-import.util';
import { isDefined } from 'src/utils/is-defined';

export const settleCallRecordingMedia = async ({
  coreApiClient,
  callRecordingId,
  fields,
  writeContext,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
  writeContext: FathomMediaWriteContext;
  fields: Pick<CallRecordingSyncFields, 'video' | 'audio'> &
    Pick<FathomRecordingImportFields, 'mediaFailureReason'>;
}): Promise<boolean> => {
  if (isDefined(fields.video) || isDefined(fields.audio)) {
    const isMediaApplied = await updateCallRecordingMedia({
      coreApiClient,
      callRecordingId,
      writeContext,
      fields: {
        ...(isDefined(fields.video) ? { video: fields.video } : {}),
        ...(isDefined(fields.audio) ? { audio: fields.audio } : {}),
      },
    });

    if (!isMediaApplied) {
      return false;
    }
  }

  const isImportApplied = await updateFathomRecordingImport({
    coreApiClient,
    writeContext,
    fields: {
      ...(isDefined(fields.mediaFailureReason)
        ? { mediaFailureReason: fields.mediaFailureReason }
        : {}),
      mediaDownloadId: null,
      mediaUploadCheckpoint: null,
    },
  });

  if (!isImportApplied) {
    return false;
  }

  await completeFathomCallRecordingImport({
    coreApiClient,
    callRecordingId,
  });

  return true;
};
