import { describe, expect, it, vi } from 'vitest';

import { countTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/count-teams-transcript-history-page-or-throw';

const buildTranscript = (transcriptId: string) => ({
  meeting: { id: 'meeting-1', subject: 'Weekly sync' },
  transcript: {
    id: transcriptId,
    createdDateTime: '2026-09-01T10:00:00Z',
    endDateTime: '2026-09-01T10:30:00Z',
  },
});

describe('countTeamsTranscriptHistoryPageOrThrow', () => {
  it('should count a transcript listed for two occurrences once, as the import writes it once', async () => {
    const coreApiClient = {
      query: vi.fn().mockResolvedValue({ callRecordings: { edges: [] } }),
    };

    await expect(
      countTeamsTranscriptHistoryPageOrThrow({
        coreApiClient,
        transcripts: ['shared', 'shared', 'other'].map(buildTranscript),
      }),
    ).resolves.toMatchObject({ transcriptCount: 2 });
  });
});
