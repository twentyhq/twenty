import type { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { areAllSyncCursorsEmpty } from '@modules/resend/sync/utils/are-all-sync-cursors-empty';

type CursorNode = {
  step: string;
  cursor: string | null;
  lastRunStatus: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | null;
};

const makeClient = (nodes: CursorNode[]) =>
  ({
    query: vi.fn(async () => ({
      resendSyncCursors: {
        edges: nodes.map((node) => ({ node })),
      },
    })),
    mutation: vi.fn(),
  }) as unknown as CoreApiClient;

const allSuccessfulRows: CursorNode[] = [
  { step: 'TOPICS', cursor: null, lastRunStatus: 'SUCCESS' },
  { step: 'SEGMENTS', cursor: null, lastRunStatus: 'SUCCESS' },
  { step: 'TEMPLATES', cursor: null, lastRunStatus: 'SUCCESS' },
  { step: 'CONTACTS', cursor: null, lastRunStatus: 'SUCCESS' },
  { step: 'EMAILS', cursor: null, lastRunStatus: 'SUCCESS' },
  { step: 'BROADCASTS', cursor: null, lastRunStatus: 'SUCCESS' },
];

describe('areAllSyncCursorsEmpty', () => {
  it('returns true when every required step has a null cursor and SUCCESS status', async () => {
    const client = makeClient(allSuccessfulRows);

    await expect(areAllSyncCursorsEmpty(client)).resolves.toBe(true);
  });

  it('returns true when a step is IN_PROGRESS but cursor is cleared', async () => {
    const client = makeClient(
      allSuccessfulRows.map((row) =>
        row.step === 'EMAILS'
          ? { ...row, lastRunStatus: 'IN_PROGRESS' }
          : row,
      ),
    );

    await expect(areAllSyncCursorsEmpty(client)).resolves.toBe(true);
  });

  it('returns false when the TOPICS row is missing entirely', async () => {
    const client = makeClient(
      allSuccessfulRows.filter((row) => row.step !== 'TOPICS'),
    );

    await expect(areAllSyncCursorsEmpty(client)).resolves.toBe(false);
  });

  it('returns false when a step is missing a cursor row', async () => {
    const client = makeClient(
      allSuccessfulRows.filter((row) => row.step !== 'EMAILS'),
    );

    await expect(areAllSyncCursorsEmpty(client)).resolves.toBe(false);
  });

  it('returns false when a cursor is not yet drained', async () => {
    const client = makeClient(
      allSuccessfulRows.map((row) =>
        row.step === 'EMAILS' ? { ...row, cursor: 'resume-me' } : row,
      ),
    );

    await expect(areAllSyncCursorsEmpty(client)).resolves.toBe(false);
  });

  it('returns false when last run failed', async () => {
    const client = makeClient(
      allSuccessfulRows.map((row) =>
        row.step === 'BROADCASTS' ? { ...row, lastRunStatus: 'FAILED' } : row,
      ),
    );

    await expect(areAllSyncCursorsEmpty(client)).resolves.toBe(false);
  });
});
