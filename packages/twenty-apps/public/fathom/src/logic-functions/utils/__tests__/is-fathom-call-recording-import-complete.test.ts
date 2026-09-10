import { describe, expect, it } from 'vitest';

import { isFathomCallRecordingImportComplete } from 'src/logic-functions/utils/is-fathom-call-recording-import-complete.util';

describe('isFathomCallRecordingImportComplete', () => {
  it.each([
    { hasVideo: true, hasAudio: false, failureReason: undefined },
    { hasVideo: false, hasAudio: true, failureReason: undefined },
    {
      hasVideo: false,
      hasAudio: false,
      failureReason: 'no_downloadable_media',
    },
  ])('completes when transcript and media are terminal', (mediaState) => {
    expect(
      isFathomCallRecordingImportComplete({
        hasTranscript: true,
        ...mediaState,
      }),
    ).toBe(true);
  });

  it('waits for media after the transcript arrives', () => {
    expect(
      isFathomCallRecordingImportComplete({
        hasTranscript: true,
        hasVideo: false,
        hasAudio: false,
        failureReason: undefined,
      }),
    ).toBe(false);
  });

  it('waits for the transcript after media arrives', () => {
    expect(
      isFathomCallRecordingImportComplete({
        hasTranscript: false,
        hasVideo: true,
        hasAudio: false,
        failureReason: undefined,
      }),
    ).toBe(false);
  });
});
