import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { resetAllSyncCursors } from '@modules/resend/sync/cursor/utils/reset-all-sync-cursors';

type CursorNode = {
  id: string;
  step?: string;
  cursor?: string | null;
  lastRunStatus?: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | null;
};

const makeClient = (nodes: CursorNode[]) => {
  const mutationCalls: Array<Record<string, unknown>> = [];

  const query = vi.fn(async () => ({
    resendSyncCursors: {
      edges: nodes.map((node) => ({ node })),
    },
  }));

  const mutation = vi.fn(async (m: Record<string, unknown>) => {
    mutationCalls.push(m);

    return { updateResendSyncCursor: { id: 'updated' } };
  });

  const client = { query, mutation } as unknown as CoreApiClient;

  return { client, mutationCalls, query, mutation };
};

const extractUpdateArgs = (call: Record<string, unknown>) => {
  const updateBlock = call.updateResendSyncCursor as
    | { __args?: { id?: string; data?: Record<string, unknown> } }
    | undefined;

  return updateBlock?.__args;
};

describe('resetAllSyncCursors', () => {
  it('issues no mutations when there are no rows', async () => {
    const { client, mutation } = makeClient([]);

    await resetAllSyncCursors(client);

    expect(mutation).not.toHaveBeenCalled();
  });

  it('resets every returned row with cursor/lastRunAt/lastRunStatus nulled', async () => {
    const nodes: CursorNode[] = [
      { id: 'row-1', step: 'TOPICS', cursor: null, lastRunStatus: 'SUCCESS' },
      { id: 'row-2', step: 'EMAILS', cursor: 'mid', lastRunStatus: 'IN_PROGRESS' },
      { id: 'row-3', step: 'BROADCASTS', cursor: null, lastRunStatus: 'FAILED' },
    ];
    const { client, mutationCalls } = makeClient(nodes);

    await resetAllSyncCursors(client);

    expect(mutationCalls).toHaveLength(3);

    const updatedIds = mutationCalls
      .map((call) => extractUpdateArgs(call)?.id)
      .sort();

    expect(updatedIds).toEqual(['row-1', 'row-2', 'row-3']);

    for (const call of mutationCalls) {
      expect(extractUpdateArgs(call)?.data).toEqual({
        cursor: null,
        lastRunAt: null,
        lastRunStatus: null,
      });
    }
  });

  it('skips edges whose node has no id', async () => {
    const { client, mutationCalls } = makeClient([
      { id: 'row-1' },
      { id: '' },
    ]);

    await resetAllSyncCursors(client);

    expect(mutationCalls).toHaveLength(1);
    expect(extractUpdateArgs(mutationCalls[0])?.id).toBe('row-1');
  });
});
