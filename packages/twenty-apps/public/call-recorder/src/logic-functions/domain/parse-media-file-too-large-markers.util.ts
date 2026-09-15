import {
  AUDIO_FILE_TOO_LARGE_FAILURE_REASON,
  VIDEO_FILE_TOO_LARGE_FAILURE_REASON,
} from 'src/logic-functions/constants/media-file-too-large-failure-reasons';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export type MediaFileTooLargeMarkers = {
  audioFileTooLarge: boolean;
  videoFileTooLarge: boolean;
};

export const parseMediaFileTooLargeMarkers = (
  callRecorderFailureReason: string | null | undefined,
): MediaFileTooLargeMarkers => {
  const failureReasons = isNonEmptyString(callRecorderFailureReason)
    ? callRecorderFailureReason.split(',').map((reason) => reason.trim())
    : [];

  return {
    audioFileTooLarge: failureReasons.includes(
      AUDIO_FILE_TOO_LARGE_FAILURE_REASON,
    ),
    videoFileTooLarge: failureReasons.includes(
      VIDEO_FILE_TOO_LARGE_FAILURE_REASON,
    ),
  };
};
