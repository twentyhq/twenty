import { describe, expect, it } from 'vitest';

import { TEAMS_TRANSCRIPT_HISTORY_MAX_PAGES } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-max-pages';
import { getTeamsTranscriptHistoryPageTransition } from 'src/features/transcripts/logic-functions/utils/get-teams-transcript-history-page-transition';

const NOW = Date.parse('2026-09-15T00:05:00.000Z');

const NEXT_PAGE_URL =
  'https://graph.microsoft.com/v1.0/me/calendarView?$skiptoken=abc';

const STATE = {
  runId: 'a1b2c3d4e5f60718',
  windowStart: '2026-07-01T00:00:00.000Z',
  windowEnd: '2026-09-15T00:00:00.000Z',
  phase: 'importing' as const,
  pageCount: 3,
  importedCount: 10,
  skippedCount: 2,
  unavailableCount: 1,
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const PAGE_COUNTS = {
  importedCount: 5,
  skippedCount: 1,
  unavailableCount: 1,
};

const EMPTY_PAGE_COUNTS = {
  importedCount: 0,
  skippedCount: 0,
  unavailableCount: 0,
};

const JOB = {
  connectedAccountId: 'connected-account-1',
  runId: STATE.runId,
  chunkIndex: 1,
  pageIndex: 3,
  attempt: 2,
};

describe('getTeamsTranscriptHistoryPageTransition', () => {
  it('should add the page counts and continue on the next calendar page of the chunk', () => {
    expect(
      getTeamsTranscriptHistoryPageTransition({
        state: STATE,
        job: JOB,
        pageCounts: PAGE_COUNTS,
        nextPageUrl: NEXT_PAGE_URL,
        now: NOW,
      }),
    ).toEqual({
      state: {
        ...STATE,
        importedCount: 15,
        skippedCount: 3,
        unavailableCount: 2,
        pageCount: 4,
        updatedAt: '2026-09-15T00:05:00.000Z',
      },
      nextJob: {
        ...JOB,
        pageIndex: 4,
        attempt: 0,
        nextPageUrl: NEXT_PAGE_URL,
      },
    });
  });

  it('should move to the older chunk after the last page of a chunk', () => {
    expect(
      getTeamsTranscriptHistoryPageTransition({
        state: STATE,
        job: { ...JOB, nextPageUrl: NEXT_PAGE_URL },
        pageCounts: EMPTY_PAGE_COUNTS,
        now: NOW,
      }),
    ).toEqual({
      state: {
        ...STATE,
        pageCount: 4,
        updatedAt: '2026-09-15T00:05:00.000Z',
      },
      nextJob: {
        connectedAccountId: JOB.connectedAccountId,
        runId: JOB.runId,
        chunkIndex: 2,
        pageIndex: 4,
        attempt: 0,
      },
    });
  });

  it('should complete the import after the last page of the oldest chunk', () => {
    const transition = getTeamsTranscriptHistoryPageTransition({
      state: STATE,
      job: { ...JOB, chunkIndex: 2 },
      pageCounts: PAGE_COUNTS,
      now: NOW,
    });

    expect(transition.nextJob).toBeUndefined();
    expect(transition.state).toMatchObject({
      phase: 'imported',
      importedCount: 15,
      skippedCount: 3,
      unavailableCount: 2,
    });
  });

  it('should fail the run instead of completing it at the page limit', () => {
    const transition = getTeamsTranscriptHistoryPageTransition({
      state: { ...STATE, pageCount: TEAMS_TRANSCRIPT_HISTORY_MAX_PAGES - 1 },
      job: { ...JOB, pageIndex: TEAMS_TRANSCRIPT_HISTORY_MAX_PAGES - 1 },
      pageCounts: EMPTY_PAGE_COUNTS,
      nextPageUrl: NEXT_PAGE_URL,
      now: NOW,
    });

    expect(transition.nextJob).toBeUndefined();
    expect(transition.state).toMatchObject({
      phase: 'failed',
      errorCode: 'page-limit-reached',
    });
  });

  it('should only schedule the next page when a retried page was already counted', () => {
    expect(
      getTeamsTranscriptHistoryPageTransition({
        state: { ...STATE, pageCount: 4 },
        job: JOB,
        pageCounts: PAGE_COUNTS,
        nextPageUrl: NEXT_PAGE_URL,
        now: NOW,
      }),
    ).toEqual({
      nextJob: {
        ...JOB,
        pageIndex: 4,
        attempt: 0,
        nextPageUrl: NEXT_PAGE_URL,
      },
    });
  });
});
