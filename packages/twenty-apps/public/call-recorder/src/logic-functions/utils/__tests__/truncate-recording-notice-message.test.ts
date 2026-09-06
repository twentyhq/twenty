import { describe, expect, it } from 'vitest';

import { CALL_RECORDER_RECORDING_NOTICE_MAX_LENGTH } from 'src/logic-functions/constants/call-recorder-recording-notice-max-length';
import { truncateRecordingNoticeMessage } from 'src/logic-functions/utils/truncate-recording-notice-message.util';

describe('truncateRecordingNoticeMessage', () => {
  it('allows astral Unicode characters up to the code-point limit', () => {
    const message = '😀'.repeat(CALL_RECORDER_RECORDING_NOTICE_MAX_LENGTH);

    expect(truncateRecordingNoticeMessage(message)).toBe(message);
  });

  it('does not split a grapheme cluster at the code-point limit', () => {
    const prefix = 'a'.repeat(CALL_RECORDER_RECORDING_NOTICE_MAX_LENGTH - 1);

    expect(truncateRecordingNoticeMessage(`${prefix}🇫🇷extra`)).toBe(prefix);
  });
});
