import { describe, expect, it } from 'vitest';

import { extractGoogleMeetNameFromDocTitle } from 'src/logic-functions/utils/extract-google-meet-name-from-doc-title.util';

describe('extractGoogleMeetNameFromDocTitle', () => {
  it('should drop the suffix Meet adds to an instant meeting document', () => {
    expect(
      extractGoogleMeetNameFromDocTitle(
        'Meeting started 2026/11/17 18:10 IST - Notes by Gemini',
      ),
    ).toBe('Meeting started 2026/11/17 18:10 IST');
  });

  it('should keep the dashes inside a scheduled meeting name', () => {
    expect(
      extractGoogleMeetNameFromDocTitle(
        'Acme - Weekly sync - 2026/11/17 12:41 IST - Transcription',
      ),
    ).toBe('Acme - Weekly sync - 2026/11/17 12:41 IST');
  });

  it('should keep a renamed document title without suffix', () => {
    expect(extractGoogleMeetNameFromDocTitle('Board review')).toBe(
      'Board review',
    );
  });

  it('should return undefined for a missing or blank title', () => {
    expect(extractGoogleMeetNameFromDocTitle(undefined)).toBeUndefined();
    expect(extractGoogleMeetNameFromDocTitle(' - Transcript')).toBeUndefined();
  });
});
