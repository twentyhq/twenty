import { describe, expect, it } from 'vitest';

import { isRealTranscript } from 'src/logic-functions/domain/is-real-transcript.util';

describe('isRealTranscript', () => {
  it('is true for a non-empty diarized array', () => {
    expect(isRealTranscript([{ participant: { name: 'A' }, words: [] }])).toBe(
      true,
    );
  });

  it('is false for an empty array', () => {
    expect(isRealTranscript([])).toBe(false);
  });

  it('is false for PENDING/FAILED markers', () => {
    expect(
      isRealTranscript({ status: 'PENDING', recallTranscriptId: 'x' }),
    ).toBe(false);
    expect(isRealTranscript({ status: 'FAILED' })).toBe(false);
  });

  it('is false when unset', () => {
    expect(isRealTranscript(null)).toBe(false);
    expect(isRealTranscript(undefined)).toBe(false);
  });
});
