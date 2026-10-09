import { describe, expect, it } from 'vitest';

import { isTeamsTranscriptHistoryStalled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-history-stalled';

const NOW = Date.parse('2026-09-15T12:00:00.000Z');

describe('isTeamsTranscriptHistoryStalled', () => {
  it.each(['counting', 'importing'] as const)(
    'should consider a %s run stalled after 40 minutes without progress',
    (phase) => {
      expect(
        isTeamsTranscriptHistoryStalled({
          state: { phase, updatedAt: '2026-09-15T11:19:59.000Z' },
          now: NOW,
        }),
      ).toBe(true);
      expect(
        isTeamsTranscriptHistoryStalled({
          state: { phase, updatedAt: '2026-09-15T11:20:00.000Z' },
          now: NOW,
        }),
      ).toBe(false);
    },
  );

  it.each(['counted', 'imported', 'failed'] as const)(
    'should never consider a %s run stalled',
    (phase) => {
      expect(
        isTeamsTranscriptHistoryStalled({
          state: { phase, updatedAt: '2026-01-01T00:00:00.000Z' },
          now: NOW,
        }),
      ).toBe(false);
    },
  );
});
