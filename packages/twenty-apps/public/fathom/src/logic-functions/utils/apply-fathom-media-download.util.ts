import { type RecordingDownload } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import {
  importFathomMediaFile,
  type FathomMediaKind,
} from 'src/logic-functions/utils/import-fathom-media-file.util';
import { updateCallRecordingMedia } from 'src/logic-functions/utils/update-call-recording-media.util';

export type ApplyFathomMediaDownloadResult =
  | { outcome: 'imported'; kind: FathomMediaKind }
  | { outcome: 'too-large'; kind: FathomMediaKind; sizeBytes: number }
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
    return {
      outcome: 'unavailable',
      reason: download.failureReason ?? 'generation_failed',
    };
  }

  // The signed URL is valid for about a day, far beyond the poll window, so an
  // expired download means the job itself was delayed and re-polling is futile.
  if (download.status === 'expired') {
    return { outcome: 'unavailable', reason: 'expired' };
  }

  const kind: FathomMediaKind = isDefined(download.video) ? 'video' : 'audio';
  const downloadFile = download.video ?? download.audio;

  if (!isDefined(downloadFile)) {
    return { outcome: 'unavailable', reason: 'completed without a file' };
  }

  const importResult = await importFathomMediaFile({
    callRecordingId,
    kind,
    downloadFile,
  });

  if (importResult.outcome === 'too-large') {
    return { outcome: 'too-large', kind, sizeBytes: importResult.sizeBytes };
  }

  await updateCallRecordingMedia({
    coreApiClient,
    callRecordingId,
    fields: { [kind]: importResult.files },
  });

  return { outcome: 'imported', kind };
};
