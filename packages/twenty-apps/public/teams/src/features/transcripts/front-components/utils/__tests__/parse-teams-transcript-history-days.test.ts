import { describe, expect, it } from 'vitest';

import { parseTeamsTranscriptHistoryDays } from 'src/features/transcripts/front-components/utils/parse-teams-transcript-history-days';

describe('parseTeamsTranscriptHistoryDays', () => {
  it.each([
    { text: '1', days: 1 },
    { text: '365', days: 365 },
    { text: ' 90 ', days: 90 },
  ])('should accept $text as $days days', ({ text, days }) => {
    expect(parseTeamsTranscriptHistoryDays(text)).toBe(days);
  });

  it.each(['', ' ', '0', '-1', '366', '1.5', '90days', '1e2', '0x1f'])(
    'should reject %j',
    (text) => {
      expect(parseTeamsTranscriptHistoryDays(text)).toBeUndefined();
    },
  );
});
