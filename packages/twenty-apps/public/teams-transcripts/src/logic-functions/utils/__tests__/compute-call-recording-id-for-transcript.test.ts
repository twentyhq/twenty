import { describe, expect, it } from 'vitest';

import { computeCallRecordingIdForTranscript } from 'src/logic-functions/utils/compute-call-recording-id-for-transcript.util';

describe('computeCallRecordingIdForTranscript', () => {
  it('returns one stable UUID v4 per transcript id', () => {
    const firstId = computeCallRecordingIdForTranscript('MSMjMCMj');
    const secondId = computeCallRecordingIdForTranscript('MSMjMCMj');

    expect(firstId).toBe(secondId);
    expect(firstId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('uses a different UUID for a different transcript', () => {
    expect(computeCallRecordingIdForTranscript('a')).not.toBe(
      computeCallRecordingIdForTranscript('b'),
    );
  });
});
