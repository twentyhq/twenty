import { describe, expect, it } from 'vitest';

import { TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT } from 'src/features/transcripts/constants/teams-transcript-history-max-import-count';
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
        isImportLimitReachedOnPage: false,
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
        isImportLimitReachedOnPage: false,
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
      isImportLimitReachedOnPage: false,
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
      isImportLimitReachedOnPage: false,
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

  it('should finish the import normally when its last page fills the import limit exactly', () => {
    const transition = getTeamsTranscriptHistoryPageTransition({
      state: {
        ...STATE,
        phase: 'importing',
        importedCount: TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT - 3,
      },
      job: { ...JOB, chunkIndex: 2 },
      phase: 'importing',
      isImportLimitReachedOnPage: false,
      pageCounts: { ...EMPTY_PAGE_COUNTS, importedCount: 3 },
      now: NOW,
    });

    expect(transition.nextJob).toBeUndefined();
    expect(transition.state).toMatchObject({
      phase: 'imported',
      importedCount: TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT,
      checkedThrough: '2026-07-01T00:00:00.000Z',
    });
    expect(transition.state.isImportLimitReached).toBeUndefined();
  });

  it('should stop at the import limit when the last page still had transcripts to import', () => {
    const transition = getTeamsTranscriptHistoryPageTransition({
      state: {
        ...STATE,
        phase: 'importing',
        importedCount: TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT - 3,
      },
      job: { ...JOB, chunkIndex: 2 },
      phase: 'importing',
      isImportLimitReachedOnPage: true,
      pageCounts: { ...EMPTY_PAGE_COUNTS, importedCount: 3 },
      now: NOW,
    });

    expect(transition.state).toMatchObject({
      phase: 'imported',
      isImportLimitReached: true,
      checkedThrough: STATE.checkedThrough,
    });
  });

  it('should end the uncounted import on connect at the import limit while older pages remain, without marking the page as checked', () => {
    const transition = getTeamsTranscriptHistoryPageTransition({
      state: {
        ...STATE,
        phase: 'importing',
        transcriptCount: 0,
        alreadyImportedCount: 0,
        deletedCount: 0,
        importedCount: TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT - 3,
      },
      job: { ...JOB, nextPageUrl: NEXT_PAGE_URL },
      phase: 'importing',
      isImportLimitReachedOnPage: false,
      pageCounts: { ...EMPTY_PAGE_COUNTS, importedCount: 3 },
      now: NOW,
    });

    expect(transition.nextJob).toBeUndefined();
    expect(transition.state).toMatchObject({
      phase: 'imported',
      isImportLimitReached: true,
      importedCount: TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT,
      checkedThrough: STATE.checkedThrough,
    });
  });

  it('should finish a counted import at the import limit without asking to count again, as everything counted is in', () => {
    const transition = getTeamsTranscriptHistoryPageTransition({
      state: {
        ...STATE,
        phase: 'importing',
        transcriptCount: TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT,
        alreadyImportedCount: 0,
        deletedCount: 0,
        importedCount: TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT - 3,
      },
      job: { ...JOB, nextPageUrl: NEXT_PAGE_URL },
      phase: 'importing',
      isImportLimitReachedOnPage: false,
      pageCounts: { ...EMPTY_PAGE_COUNTS, importedCount: 3 },
      now: NOW,
    });

    expect(transition.nextJob).toBeUndefined();
    expect(transition.state.phase).toBe('imported');
    expect(transition.state.isImportLimitReached).toBeUndefined();
  });

  it('should fail the run instead of completing it at the page limit', () => {
    const transition = getTeamsTranscriptHistoryPageTransition({
      state: { ...STATE, pageCount: TEAMS_TRANSCRIPT_HISTORY_MAX_PAGES - 1 },
      job: { ...JOB, pageIndex: TEAMS_TRANSCRIPT_HISTORY_MAX_PAGES - 1 },
      phase: 'counting',
      isImportLimitReachedOnPage: false,
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
});
