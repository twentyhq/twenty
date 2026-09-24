import { CALL_RECORDER_RECORDING_NOTICE_MAX_LENGTH } from 'src/logic-functions/constants/call-recorder-recording-notice-max-length';

const recordingNoticeGraphemeSegmenter = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
});

export const truncateRecordingNoticeMessage = (message: string): string => {
  let truncatedMessage = '';
  let unicodeCodePointCount = 0;

  for (const { segment } of recordingNoticeGraphemeSegmenter.segment(message)) {
    const segmentUnicodeCodePointCount = Array.from(segment).length;

    if (
      unicodeCodePointCount + segmentUnicodeCodePointCount >
      CALL_RECORDER_RECORDING_NOTICE_MAX_LENGTH
    ) {
      break;
    }

    truncatedMessage += segment;
    unicodeCodePointCount += segmentUnicodeCodePointCount;
  }

  return truncatedMessage;
};
