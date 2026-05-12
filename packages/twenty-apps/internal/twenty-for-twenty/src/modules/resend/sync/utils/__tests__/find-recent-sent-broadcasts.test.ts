import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findRecentSentBroadcasts } from '@modules/resend/sync/utils/find-recent-sent-broadcasts';

type QueryMock = ReturnType<typeof vi.fn>;

const buildClient = (query: QueryMock): CoreApiClient =>
  ({ query }) as unknown as CoreApiClient;

describe('findRecentSentBroadcasts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries resendBroadcasts with a sentAt gte filter', async () => {
    const query = vi.fn(async () => ({
      resendBroadcasts: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    }));

    await findRecentSentBroadcasts(buildClient(query), {
      sinceIso: '2026-01-01T00:00:00.000Z',
    });

    expect(query).toHaveBeenCalledTimes(1);

    const queryArgs = (
      query.mock.calls[0] as unknown as Array<{
        resendBroadcasts: { __args: { filter: unknown; first: number } };
      }>
    )[0].resendBroadcasts.__args;

    expect(queryArgs.filter).toEqual({
      sentAt: { gte: '2026-01-01T00:00:00.000Z' },
    });
    expect(queryArgs.first).toBeGreaterThan(0);
  });

  it('returns broadcasts sorted ascending by sentAtMs and skips invalid sentAt values', async () => {
    const query = vi.fn(async () => ({
      resendBroadcasts: {
        edges: [
          { node: { id: 'b-late', sentAt: '2026-01-01T11:00:00.000Z' } },
          { node: { id: 'b-early', sentAt: '2026-01-01T09:00:00.000Z' } },
          { node: { id: 'b-mid', sentAt: '2026-01-01T10:00:00.000Z' } },
          { node: { id: 'b-null', sentAt: null } },
          { node: { id: 'b-empty', sentAt: '' } },
          { node: { id: 'b-bad', sentAt: 'not-a-date' } },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    }));

    const result = await findRecentSentBroadcasts(buildClient(query), {
      sinceIso: '2026-01-01T00:00:00.000Z',
    });

    expect(result.map((broadcast) => broadcast.id)).toEqual([
      'b-early',
      'b-mid',
      'b-late',
    ]);
    expect(result[0].sentAtMs).toBe(
      new Date('2026-01-01T09:00:00.000Z').getTime(),
    );
  });

  it('paginates until hasNextPage is false', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        resendBroadcasts: {
          edges: [
            { node: { id: 'b-1', sentAt: '2026-01-01T09:00:00.000Z' } },
          ],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
        },
      })
      .mockResolvedValueOnce({
        resendBroadcasts: {
          edges: [
            { node: { id: 'b-2', sentAt: '2026-01-01T10:00:00.000Z' } },
          ],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
        },
      });

    const result = await findRecentSentBroadcasts(buildClient(query), {
      sinceIso: '2026-01-01T00:00:00.000Z',
    });

    expect(query).toHaveBeenCalledTimes(2);

    const secondCallArgs = (
      query.mock.calls[1] as unknown as Array<{
        resendBroadcasts: { __args: { after?: string } };
      }>
    )[0].resendBroadcasts.__args;

    expect(secondCallArgs.after).toBe('cursor-1');
    expect(result.map((broadcast) => broadcast.id)).toEqual(['b-1', 'b-2']);
  });

  it('stops paginating when endCursor is null even if hasNextPage is true', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      resendBroadcasts: {
        edges: [{ node: { id: 'b-1', sentAt: '2026-01-01T09:00:00.000Z' } }],
        pageInfo: { hasNextPage: true, endCursor: null },
      },
    });

    const result = await findRecentSentBroadcasts(buildClient(query), {
      sinceIso: '2026-01-01T00:00:00.000Z',
    });

    expect(query).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
  });
});
