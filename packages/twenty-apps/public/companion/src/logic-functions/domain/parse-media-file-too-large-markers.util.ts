import {
  AUDIO_FILE_TOO_LARGE_FAILURE_REASON,
  VIDEO_FILE_TOO_LARGE_FAILURE_REASON,
} from 'src/logic-functions/constants/media-file-too-large-failure-reasons';
import { isNonEmptyString } from '@twentyhq/recall-utils/utils/is-non-empty-string.util';

export type MediaFileTooLargeMarkers = {
  audioFileTooLarge: boolean;
  videoFileTooLarge: boolean;
};

export const parseMediaFileTooLargeMarkers = (
  companionFailureReason: string | null | undefined,
): MediaFileTooLargeMarkers => {
  const failureReasons = isNonEmptyString(companionFailureReason)
    ? companionFailureReason.split(',').map((reason) => reason.trim())
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
