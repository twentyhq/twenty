import { describe, expect, it } from 'vitest';

import { getTeamsTranscriptHistoryChunkWindow } from 'src/features/transcripts/logic-functions/utils/get-teams-transcript-history-chunk-window';

const HISTORY_WINDOW = {
  windowStart: '2026-07-01T00:00:00.000Z',
  windowEnd: '2026-09-15T00:00:00.000Z',
};

describe('getTeamsTranscriptHistoryChunkWindow', () => {
  it('should walk the window in 31-day chunks starting from the newest', () => {
    expect(
      [0, 1, 2].map((chunkIndex) =>
        getTeamsTranscriptHistoryChunkWindow({ ...HISTORY_WINDOW, chunkIndex }),
      ),
    ).toEqual([
      {
        startDateTime: '2026-08-15T00:00:00.000Z',
        endDateTime: '2026-09-15T00:00:00.000Z',
      },
      {
        startDateTime: '2026-07-15T00:00:00.000Z',
        endDateTime: '2026-08-15T00:00:00.000Z',
      },
      {
        startDateTime: '2026-07-01T00:00:00.000Z',
        endDateTime: '2026-07-15T00:00:00.000Z',
      },
    ]);
  });

  it('should return nothing once the chunk starts before the window', () => {
    expect(
      getTeamsTranscriptHistoryChunkWindow({
        ...HISTORY_WINDOW,
        chunkIndex: 3,
      }),
    ).toBeUndefined();
  });

  it('should cover a 31-day window in a single chunk', () => {
    const initialImportWindow = {
      windowStart: '2026-08-15T00:00:00.000Z',
      windowEnd: '2026-09-15T00:00:00.000Z',
    };

    expect(
      getTeamsTranscriptHistoryChunkWindow({
        ...initialImportWindow,
        chunkIndex: 0,
      }),
    ).toEqual({
      startDateTime: initialImportWindow.windowStart,
      endDateTime: initialImportWindow.windowEnd,
    });
    expect(
      getTeamsTranscriptHistoryChunkWindow({
        ...initialImportWindow,
        chunkIndex: 1,
      }),
    ).toBeUndefined();
  });
});
