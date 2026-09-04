import { type RecordingDownload } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_MEDIA_FAILURE_REASON } from 'src/constants/fathom-media-failure-reason.constant';
import {
  importFathomMediaFile,
  type FathomMediaKind,
} from 'src/logic-functions/utils/import-fathom-media-file.util';
import { recordFathomMediaFailure } from 'src/logic-functions/utils/record-fathom-media-failure.util';
import { updateCallRecordingMedia } from 'src/logic-functions/utils/update-call-recording-media.util';

export type ApplyFathomMediaDownloadResult =
  | { outcome: 'imported'; kind: FathomMediaKind }
  | { outcome: 'pending' }
  | { outcome: 'unavailable'; reason: string };

// Fathom returns video for a video recording and audio for an audio-only one,
// never both, so exactly one artifact is imported per download.
export const applyFathomMediaDownload = async ({
  coreApiClient,
  callRecordingId,
  download,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  download: RecordingDownload;
}): Promise<ApplyFathomMediaDownloadResult> => {
  if (download.status === 'processing') {
    return { outcome: 'pending' };
  }

  if (download.status === 'failed') {
    return settleUnavailable({
      coreApiClient,
      callRecordingId,
      reason: download.failureReason ?? 'generation_failed',
    });
  }

  // The signed URL is valid for about a day, far beyond the poll window, so an
  // expired download means the job itself was delayed and re-polling is futile.
  if (download.status === 'expired') {
    return settleUnavailable({
      coreApiClient,
      callRecordingId,
      reason: FATHOM_MEDIA_FAILURE_REASON.DOWNLOAD_EXPIRED,
    });
  }

  const kind: FathomMediaKind = isDefined(download.video) ? 'video' : 'audio';
  const downloadFile = download.video ?? download.audio;

  if (!isDefined(downloadFile)) {
    return settleUnavailable({
      coreApiClient,
      callRecordingId,
      reason: FATHOM_MEDIA_FAILURE_REASON.COMPLETED_WITHOUT_FILE,
    });
  }

  const importResult = await importFathomMediaFile({
    callRecordingId,
    kind,
    downloadFile,
  });

  if (importResult.outcome === 'too-large') {
    return settleUnavailable({
      coreApiClient,
      callRecordingId,
      reason: FATHOM_MEDIA_FAILURE_REASON.FILE_TOO_LARGE,
    });
  }

  await updateCallRecordingMedia({
    coreApiClient,
    callRecordingId,
    fields: { [kind]: importResult.files, fathomMediaFailureReason: null },
  });

  return { outcome: 'imported', kind };
};

const settleUnavailable = async ({
  coreApiClient,
  callRecordingId,
  reason,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  reason: string;
}): Promise<ApplyFathomMediaDownloadResult> => {
  await recordFathomMediaFailure({ coreApiClient, callRecordingId, reason });

  return { outcome: 'unavailable', reason };
};
