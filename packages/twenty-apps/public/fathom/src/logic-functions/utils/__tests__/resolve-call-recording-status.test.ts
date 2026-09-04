import { describe, expect, it } from 'vitest';

import { resolveCallRecordingStatus } from 'src/logic-functions/utils/resolve-call-recording-status.util';

describe('resolveCallRecordingStatus', () => {
  it('completes a recording whose transcript and media are both in', () => {
    expect(
      resolveCallRecordingStatus({
        hasTranscript: true,
        isMediaSettled: true,
      }),
    ).toBe('COMPLETED');
  });

  it('holds a transcribed recording whose media is still generating', () => {
    expect(
      resolveCallRecordingStatus({
        hasTranscript: true,
        isMediaSettled: false,
      }),
    ).toBe('PROCESSING');
  });

  it('holds a recording whose media settled before its transcript arrived', () => {
    expect(
      resolveCallRecordingStatus({
        hasTranscript: false,
        isMediaSettled: true,
      }),
    ).toBe('PROCESSING');
  });
});
