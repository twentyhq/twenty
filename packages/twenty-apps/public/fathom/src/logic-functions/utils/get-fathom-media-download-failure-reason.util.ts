import { type RecordingDownload } from 'fathom-typescript/sdk/models/shared';

import { FATHOM_MEDIA_FAILURE_REASON } from 'src/constants/fathom-media-failure-reason.constant';
import { isDefined } from 'src/utils/is-defined';

export const getFathomMediaDownloadFailureReason = (
  download: Pick<
    RecordingDownload,
    'status' | 'failureReason' | 'video' | 'audio'
  >,
): string | undefined => {
  if (download.status === 'processing') {
    return undefined;
  }

  if (download.status === 'expired') {
    return FATHOM_MEDIA_FAILURE_REASON.DOWNLOAD_EXPIRED;
  }

  if (download.status === 'failed') {
    return download.failureReason ?? 'generation_failed';
  }

  if (!isDefined(download.video) && !isDefined(download.audio)) {
    return FATHOM_MEDIA_FAILURE_REASON.COMPLETED_WITHOUT_FILE;
  }

  return undefined;
};
