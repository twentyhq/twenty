import { type RecordingDownload } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { FATHOM_MEDIA_FAILURE_REASON } from 'src/constants/fathom-media-failure-reason.constant';
import { type FathomMediaUploadCheckpoint } from 'src/logic-functions/types/fathom-media-upload-checkpoint.type';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { completeFathomMediaFileUpload } from 'src/logic-functions/utils/complete-fathom-media-file-upload.util';
import { getFathomMediaDownloadFailureReason } from 'src/logic-functions/utils/get-fathom-media-download-failure-reason.util';
import { importFathomMediaFile } from 'src/logic-functions/utils/import-fathom-media-file.util';
import { recordFathomMediaFailure } from 'src/logic-functions/utils/record-fathom-media-failure.util';
import { settleCallRecordingMedia } from 'src/logic-functions/utils/settle-call-recording-media.util';
import { isDefined } from 'src/utils/is-defined';

export const applyFathomMediaDownload = async ({
  coreApiClient,
  callRecordingId,
  writeContext,
  uploadCheckpoint,
  download,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
  writeContext: FathomMediaWriteContext & { downloadId: string };
  uploadCheckpoint: FathomMediaUploadCheckpoint | undefined;
  download: Pick<
    RecordingDownload,
    'status' | 'failureReason' | 'video' | 'audio'
  >;
}): Promise<'imported' | 'pending' | 'unavailable' | 'stale'> => {
  const updateOptions = { coreApiClient, callRecordingId, writeContext };

  if (uploadCheckpoint?.downloadId === writeContext.downloadId) {
    await completeFathomMediaFileUpload({ fileId: uploadCheckpoint.fileId });
    const isApplied = await settleCallRecordingMedia({
      ...updateOptions,
      fields: {
        [uploadCheckpoint.kind]: [
          {
            fileId: uploadCheckpoint.fileId,
            label:
              uploadCheckpoint.kind === 'video' ? 'video.mp4' : 'audio.mp3',
          },
        ],
        fathomMediaFailureReason: null,
      },
    });

    return isApplied ? 'imported' : 'stale';
  }

  if (download.status === 'processing') {
    return 'pending';
  }

  const downloadFile = download.video ?? download.audio;
  const failureReason = getFathomMediaDownloadFailureReason(download);

  if (isDefined(failureReason) || !isDefined(downloadFile)) {
    const isApplied = await recordFathomMediaFailure({
      ...updateOptions,
      reason:
        failureReason ?? FATHOM_MEDIA_FAILURE_REASON.COMPLETED_WITHOUT_FILE,
    });

    return isApplied ? 'unavailable' : 'stale';
  }

  const kind = isDefined(download.video) ? 'video' : 'audio';
  const result = await importFathomMediaFile({
    ...updateOptions,
    downloadId: writeContext.downloadId,
    kind,
    downloadFile,
  });

  if (result.outcome === 'stale') {
    return 'stale';
  }

  if (result.outcome !== 'imported') {
    const isApplied = await recordFathomMediaFailure({
      ...updateOptions,
      reason:
        result.outcome === 'too-large'
          ? FATHOM_MEDIA_FAILURE_REASON.FILE_TOO_LARGE
          : FATHOM_MEDIA_FAILURE_REASON.COMPLETED_WITHOUT_FILE,
    });

    return isApplied ? 'unavailable' : 'stale';
  }

  const isApplied = await settleCallRecordingMedia({
    ...updateOptions,
    fields: { [kind]: result.files, fathomMediaFailureReason: null },
  });

  return isApplied ? 'imported' : 'stale';
};
