import {
  AUDIO_FILE_TOO_LARGE_FAILURE_REASON,
  VIDEO_FILE_TOO_LARGE_FAILURE_REASON,
} from 'src/logic-functions/constants/media-file-too-large-failure-reasons';
import {
  AUDIO_IMPORT_EXPIRED_FAILURE_REASON,
  VIDEO_IMPORT_EXPIRED_FAILURE_REASON,
} from 'src/logic-functions/constants/media-import-expired-failure-reasons';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export type UnrecoverableMediaMarkers = {
  isAudioUnrecoverable: boolean;
  isVideoUnrecoverable: boolean;
};

export const parseUnrecoverableMediaMarkers = (
  callRecorderFailureReason: string | null | undefined,
): UnrecoverableMediaMarkers => {
  const failureReasons = isNonEmptyString(callRecorderFailureReason)
    ? callRecorderFailureReason.split(',').map((reason) => reason.trim())
    : [];

  return {
    isAudioUnrecoverable:
      failureReasons.includes(AUDIO_FILE_TOO_LARGE_FAILURE_REASON) ||
      failureReasons.includes(AUDIO_IMPORT_EXPIRED_FAILURE_REASON),
    isVideoUnrecoverable:
      failureReasons.includes(VIDEO_FILE_TOO_LARGE_FAILURE_REASON) ||
      failureReasons.includes(VIDEO_IMPORT_EXPIRED_FAILURE_REASON),
  };
};
