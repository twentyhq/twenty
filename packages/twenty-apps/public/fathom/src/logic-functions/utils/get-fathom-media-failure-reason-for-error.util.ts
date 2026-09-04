import { FathomError } from 'fathom-typescript/sdk/models/errors';

import { FATHOM_MEDIA_FAILURE_REASON } from 'src/constants/fathom-media-failure-reason.constant';

const FORBIDDEN_STATUS_CODE = 403;
const UNPROCESSABLE_STATUS_CODE = 422;

// 422 is a recording with no downloadable media, 403 a limited-access share the
// connected account may view but not download. Neither is worth a retry.
export const getFathomMediaFailureReasonForError = (
  error: unknown,
): string | undefined => {
  if (!(error instanceof FathomError)) {
    return undefined;
  }

  if (error.statusCode === UNPROCESSABLE_STATUS_CODE) {
    return FATHOM_MEDIA_FAILURE_REASON.NO_DOWNLOADABLE_MEDIA;
  }

  if (error.statusCode === FORBIDDEN_STATUS_CODE) {
    return FATHOM_MEDIA_FAILURE_REASON.DOWNLOAD_FORBIDDEN;
  }

  return undefined;
};
