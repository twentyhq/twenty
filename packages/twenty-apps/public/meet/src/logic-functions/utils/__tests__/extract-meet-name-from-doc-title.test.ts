import { describe, expect, it } from 'vitest';

import { extractMeetNameFromDocTitle } from 'src/logic-functions/utils/extract-meet-name-from-doc-title.util';

describe('extractMeetNameFromDocTitle', () => {
  it('should drop the suffix Meet adds to an instant meeting document', () => {
    expect(
      extractMeetNameFromDocTitle(
        'Meeting started 2026/11/17 18:10 IST - Notes by Gemini',
      ),
    ).toBe('Meeting started 2026/11/17 18:10 IST');
  });

  it('should keep the dashes inside a scheduled meeting name', () => {
    expect(
      extractMeetNameFromDocTitle(
        'Acme - Weekly sync - 2026/11/17 12:41 IST - Transcription',
      ),
    ).toBe('Acme - Weekly sync - 2026/11/17 12:41 IST');
  });

  it('should keep a renamed document title without suffix', () => {
    expect(extractMeetNameFromDocTitle('Board review')).toBe(
      'Board review',
    );
  });

  it('should return undefined for a missing or blank title', () => {
    expect(extractMeetNameFromDocTitle(undefined)).toBeUndefined();
    expect(extractMeetNameFromDocTitle(' - Transcript')).toBeUndefined();
  });
});
