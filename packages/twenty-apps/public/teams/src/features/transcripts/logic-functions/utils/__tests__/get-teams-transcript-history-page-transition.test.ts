import { describe, expect, it } from 'vitest';

import { TEAMS_TRANSCRIPT_HISTORY_MAX_PAGES } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-max-pages';
import { getTeamsTranscriptHistoryPageTransition } from 'src/features/transcripts/logic-functions/utils/get-teams-transcript-history-page-transition';

const NOW = Date.parse('2026-09-15T00:05:00.000Z');

const NEXT_PAGE_URL =
  'https://graph.microsoft.com/v1.0/me/calendarView?$skiptoken=abc';

const STATE = {
  runId: 'a1b2c3d4e5f60718',
  days: 76,
  windowStart: '2026-07-01T00:00:00.000Z',
  windowEnd: '2026-09-15T00:00:00.000Z',
  phase: 'counting' as const,
  transcriptCount: 10,
  alreadyImportedCount: 2,
  deletedCount: 1,
  pageCount: 3,
  importedCount: 0,
  skippedCount: 0,
  unavailableCount: 0,
  checkedThrough: '2026-08-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const EMPTY_PAGE_COUNTS = {
  transcriptCount: 0,
  alreadyImportedCount: 0,
  deletedCount: 0,
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
        phase: 'counting',
        pageCounts: {
          ...EMPTY_PAGE_COUNTS,
          transcriptCount: 5,
          alreadyImportedCount: 1,
          deletedCount: 1,
        },
        nextPageUrl: NEXT_PAGE_URL,
        now: NOW,
      }),
    ).toEqual({
      state: {
        ...STATE,
        transcriptCount: 15,
        alreadyImportedCount: 3,
        deletedCount: 2,
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

  it('should mark the chunk as checked and move to the older chunk after its last page', () => {
    expect(
      getTeamsTranscriptHistoryPageTransition({
        state: STATE,
        job: { ...JOB, nextPageUrl: NEXT_PAGE_URL },
        phase: 'counting',
        pageCounts: EMPTY_PAGE_COUNTS,
        now: NOW,
      }),
    ).toEqual({
      state: {
        ...STATE,
        pageCount: 4,
        checkedThrough: '2026-07-15T00:00:00.000Z',
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

  it('should complete the count after the last page of the oldest chunk', () => {
    const transition = getTeamsTranscriptHistoryPageTransition({
      state: STATE,
      job: { ...JOB, chunkIndex: 2 },
      phase: 'counting',
      pageCounts: EMPTY_PAGE_COUNTS,
      now: NOW,
    });

    expect(transition.nextJob).toBeUndefined();
    expect(transition.state).toMatchObject({
      phase: 'counted',
      checkedThrough: '2026-07-01T00:00:00.000Z',
    });
  });

  it('should complete the import after the last page of the oldest chunk', () => {
    const transition = getTeamsTranscriptHistoryPageTransition({
      state: { ...STATE, phase: 'importing' },
      job: { ...JOB, chunkIndex: 2 },
      phase: 'importing',
      pageCounts: {
        ...EMPTY_PAGE_COUNTS,
        importedCount: 4,
        skippedCount: 2,
        unavailableCount: 1,
      },
      now: NOW,
    });

    expect(transition.nextJob).toBeUndefined();
    expect(transition.state).toMatchObject({
      phase: 'imported',
      transcriptCount: 10,
      importedCount: 4,
      skippedCount: 2,
      unavailableCount: 1,
      checkedThrough: '2026-07-01T00:00:00.000Z',
    });
  });

  it('should fail the run instead of completing it at the page limit', () => {
    const transition = getTeamsTranscriptHistoryPageTransition({
      state: { ...STATE, pageCount: TEAMS_TRANSCRIPT_HISTORY_MAX_PAGES - 1 },
      job: { ...JOB, pageIndex: TEAMS_TRANSCRIPT_HISTORY_MAX_PAGES - 1 },
      phase: 'counting',
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
        phase: 'counting',
        pageCounts: { ...EMPTY_PAGE_COUNTS, transcriptCount: 5 },
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
