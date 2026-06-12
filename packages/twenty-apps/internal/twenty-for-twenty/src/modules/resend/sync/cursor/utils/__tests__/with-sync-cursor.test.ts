import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { withSyncCursor } from 'src/modules/resend/sync/cursor/utils/with-sync-cursor';

type CursorNode = {
  id: string;
  step: string;
  cursor: string | null;
};

const makeClient = (existingNode?: CursorNode) => {
  const mutationCalls: Array<Record<string, unknown>> = [];
  const queryCalls: Array<Record<string, unknown>> = [];

  const query = vi.fn(async (q: Record<string, unknown>) => {
    queryCalls.push(q);

    return {
      resendSyncCursors: {
        edges: existingNode ? [{ node: existingNode }] : [],
      },
    };
  });

  const mutation = vi.fn(async (m: Record<string, unknown>) => {
    mutationCalls.push(m);

    if ('createResendSyncCursor' in m) {
      return { createResendSyncCursor: { id: 'created-cursor-id' } };
    }

    return { updateResendSyncCursor: { id: 'updated' } };
  });

  const client = { query, mutation } as unknown as CoreApiClient;

  return { client, mutationCalls, queryCalls };
};

const findUpdate = (
  calls: Array<Record<string, unknown>>,
  predicate: (data: Record<string, unknown>) => boolean,
): Record<string, unknown> | undefined => {
  for (const call of calls) {
    const updateBlock = call.updateResendSyncCursor as
      | { __args?: { data?: Record<string, unknown> } }
      | undefined;

    const data = updateBlock?.__args?.data;

    if (data !== undefined && predicate(data)) {
      return data;
    }
  }

  return undefined;
};

describe('withSyncCursor', () => {
  it('creates a cursor row when none exists, then clears the cursor on success', async () => {
    const { client, mutationCalls } = makeClient();

    await withSyncCursor(client, 'SEGMENTS', async ({ resumeCursor }) => {
      expect(resumeCursor).toBeUndefined();

      return { value: undefined, completed: true };
    });

    const create = mutationCalls.find((c) => 'createResendSyncCursor' in c);

    expect(create).toBeDefined();

    const clearedUpdate = findUpdate(
      mutationCalls,
      (data) => data.cursor === null,
    );

    expect(clearedUpdate).toBeDefined();
  });

  it('resumes from stored cursor when one is persisted', async () => {
    const { client } = makeClient({
      id: 'cursor-1',
      step: 'CONTACTS',
      cursor: 'last-id',
    });

    const seen: { resumeCursor: string | undefined }[] = [];

    await withSyncCursor(client, 'CONTACTS', async (ctx) => {
      seen.push({ resumeCursor: ctx.resumeCursor });

      return { value: undefined, completed: true };
    });

    expect(seen).toEqual([{ resumeCursor: 'last-id' }]);
  });

  it('persists progress via onCursorAdvance', async () => {
    const { client, mutationCalls } = makeClient({
      id: 'cursor-1',
      step: 'EMAILS',
      cursor: null,
    });

    await withSyncCursor(client, 'EMAILS', async ({ onCursorAdvance }) => {
      await onCursorAdvance('item-99');

      return { value: undefined, completed: false };
    });

    const progress = findUpdate(
      mutationCalls,
      (data) => data.cursor === 'item-99',
    );

    expect(progress).toBeDefined();
  });

  it('preserves the resume cursor when preserveCursor=true and run completes', async () => {
    const { client, mutationCalls } = makeClient({
      id: 'cursor-1',
      step: 'EMAILS',
      cursor: 'in-progress-id',
    });

    await withSyncCursor(
      client,
      'EMAILS',
      async ({ onCursorAdvance }) => {
        await onCursorAdvance('item-99');

        return { value: undefined, completed: true };
      },
      { preserveCursor: true },
    );

    const cursorWriteAttempt = findUpdate(
      mutationCalls,
      (data) =>
        Object.prototype.hasOwnProperty.call(data, 'cursor'),
    );

    expect(cursorWriteAttempt).toBeUndefined();
  });

  it('rethrows and leaves the cursor untouched when fn throws', async () => {
    const { client, mutationCalls } = makeClient({
      id: 'cursor-1',
      step: 'CONTACTS',
      cursor: 'last-id',
    });

    await expect(
      withSyncCursor(client, 'CONTACTS', async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    const clearedUpdate = findUpdate(
      mutationCalls,
      (data) => data.cursor === null,
    );

    expect(clearedUpdate).toBeUndefined();
  });
});
