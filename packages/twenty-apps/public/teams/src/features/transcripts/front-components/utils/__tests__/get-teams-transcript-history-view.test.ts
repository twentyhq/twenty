import { describe, expect, it } from 'vitest';

import { getTeamsTranscriptHistoryView } from 'src/features/transcripts/front-components/utils/get-teams-transcript-history-view';

const STATE = {
  runId: 'a1b2c3d4e5f60718',
  days: 90,
  windowStart: '2026-06-17T00:00:00.000Z',
  windowEnd: '2026-09-15T00:00:00.000Z',
  transcriptCount: 0,
  alreadyImportedCount: 0,
  deletedCount: 0,
  pageCount: 0,
  importedCount: 0,
  skippedCount: 0,
  unavailableCount: 0,
  updatedAt: '2026-09-15T00:00:00.000Z',
};

describe('getTeamsTranscriptHistoryView', () => {
  it('should be idle without a run and stalled when the run stopped progressing', () => {
    expect(
      getTeamsTranscriptHistoryView({ state: null, isStalled: false }),
    ).toEqual({ kind: 'idle' });
    expect(
      getTeamsTranscriptHistoryView({
        state: { ...STATE, phase: 'importing' },
        isStalled: true,
      }),
    ).toEqual({ kind: 'stalled' });
  });

  it('should count the transcripts left to import over the counted window', () => {
    expect(
      getTeamsTranscriptHistoryView({
        state: {
          ...STATE,
          phase: 'counted',
          transcriptCount: 40,
          alreadyImportedCount: 12,
          deletedCount: 3,
          pageCount: 7,
        },
        isStalled: false,
      }),
    ).toEqual({
      kind: 'counted',
      runId: STATE.runId,
      days: 90,
      transcriptCount: 40,
      alreadyImportedCount: 12,
      deletedCount: 3,
      toImportCount: 25,
      importEstimate: { unit: 'minute', count: 7 },
    });
  });

  it('should estimate at least one minute and switch to whole hours from 60 minutes', () => {
    expect(
      getTeamsTranscriptHistoryView({
        state: { ...STATE, phase: 'counted' },
        isStalled: false,
      }),
    ).toMatchObject({
      toImportCount: 0,
      importEstimate: { unit: 'minute', count: 1 },
    });
    expect(
      getTeamsTranscriptHistoryView({
        state: { ...STATE, phase: 'counted', pageCount: 59 },
        isStalled: false,
      }),
    ).toMatchObject({ importEstimate: { unit: 'minute', count: 59 } });
    expect(
      getTeamsTranscriptHistoryView({
        state: { ...STATE, phase: 'counted', pageCount: 61 },
        isStalled: false,
      }),
    ).toMatchObject({ importEstimate: { unit: 'hour', count: 2 } });
  });

  it('should report the count progress while counting', () => {
    expect(
      getTeamsTranscriptHistoryView({
        state: {
          ...STATE,
          phase: 'counting',
          checkedThrough: '2026-08-15T00:00:00.000Z',
        },
        isStalled: false,
      }),
    ).toEqual({ kind: 'counting', checkedThrough: '2026-08-15T00:00:00.000Z' });
  });

  it('should compare the import progress to the count when the run was counted', () => {
    expect(
      getTeamsTranscriptHistoryView({
        state: {
          ...STATE,
          phase: 'importing',
          transcriptCount: 40,
          alreadyImportedCount: 12,
          deletedCount: 3,
          importedCount: 10,
          skippedCount: 4,
          unavailableCount: 1,
        },
        isStalled: false,
      }),
    ).toEqual({
      kind: 'importing',
      importedCount: 10,
      skippedCount: 4,
      unavailableCount: 1,
      toImportCount: 25,
    });
  });

  it('should report how far back the import on connect checked, which has no count', () => {
    expect(
      getTeamsTranscriptHistoryView({
        state: {
          ...STATE,
          phase: 'imported',
          importedCount: 25,
          skippedCount: 4,
          unavailableCount: 1,
          checkedThrough: '2026-08-15T00:00:00.000Z',
        },
        isStalled: false,
      }),
    ).toEqual({
      kind: 'imported',
      importedCount: 25,
      skippedCount: 4,
      unavailableCount: 1,
      checkedThrough: '2026-08-15T00:00:00.000Z',
    });
  });

  it('should keep the failure code and treat a missing one as unknown', () => {
    expect(
      getTeamsTranscriptHistoryView({
        state: { ...STATE, phase: 'failed', errorCode: 'reconnect-required' },
        isStalled: false,
      }),
    ).toEqual({ kind: 'failed', errorCode: 'reconnect-required' });
    expect(
      getTeamsTranscriptHistoryView({
        state: { ...STATE, phase: 'failed' },
        isStalled: false,
      }),
    ).toEqual({ kind: 'failed', errorCode: 'unknown' });
  });
});
