import { AUDIO_FILE_TOO_LARGE_FAILURE_REASON } from 'src/logic-functions/constants/AUDIO_FILE_TOO_LARGE_FAILURE_REASON';
import { VIDEO_FILE_TOO_LARGE_FAILURE_REASON } from 'src/logic-functions/constants/VIDEO_FILE_TOO_LARGE_FAILURE_REASON';
import { isNonEmptyString } from 'src/logic-functions/utils/isNonEmptyString';
import { type MediaFileTooLargeMarkers } from 'src/logic-functions/types/MediaFileTooLargeMarkers';

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
