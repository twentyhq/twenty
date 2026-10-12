import { describe, expect, it } from 'vitest';

import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { shouldStartTeamsTranscriptHistoryInitialImport } from 'src/features/transcripts/logic-functions/utils/should-start-teams-transcript-history-initial-import';

const NOW = Date.parse('2026-09-15T12:00:00.000Z');

const buildState = (
  overrides: Partial<TeamsTranscriptHistoryState>,
): TeamsTranscriptHistoryState => ({
  runId: 'run-1',
  days: 31,
  windowStart: '2026-08-15T12:00:00.000Z',
  windowEnd: '2026-09-15T11:50:00.000Z',
  phase: 'importing',
  transcriptCount: 0,
  alreadyImportedCount: 0,
  deletedCount: 0,
  pageCount: 1,
  importedCount: 3,
  skippedCount: 0,
  unavailableCount: 0,
  updatedAt: '2026-09-15T11:55:00.000Z',
  ...overrides,
});

describe('shouldStartTeamsTranscriptHistoryInitialImport', () => {
  it('should start the first import of a connection', () => {
    expect(
      shouldStartTeamsTranscriptHistoryInitialImport({
        hasStartedInitialImport: false,
        state: null,
        now: NOW,
      }),
    ).toBe(true);
  });

  it.each([
    ['an importing run', buildState({})],
    ['a finished run', buildState({ phase: 'imported' })],
    [
      'a run that reached the page limit',
      buildState({ phase: 'failed', errorCode: 'page-limit-reached' }),
    ],
  ])('should keep %s', (_, state) => {
    expect(
      shouldStartTeamsTranscriptHistoryInitialImport({
        hasStartedInitialImport: true,
        state,
        now: NOW,
      }),
    ).toBe(false);
  });

  it.each([
    [
      'a run that needed a reconnect',
      buildState({ phase: 'failed', errorCode: 'reconnect-required' }),
    ],
    [
      'a run that failed',
      buildState({ phase: 'failed', errorCode: 'unknown' }),
    ],
    ['a stalled run', buildState({ updatedAt: '2026-09-15T11:00:00.000Z' })],
    ['a run whose state is gone', null],
  ])('should start again after %s', (_, state) => {
    expect(
      shouldStartTeamsTranscriptHistoryInitialImport({
        hasStartedInitialImport: true,
        state,
        now: NOW,
      }),
    ).toBe(true);
  });
});
