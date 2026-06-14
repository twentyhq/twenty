import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { syncTopics } from '@modules/resend/sync/utils/sync-topics';

vi.mock('@modules/resend/sync/utils/upsert-records', () => ({
  upsertRecords: vi.fn(),
}));

vi.mock('@modules/resend/sync/cursor/utils/with-sync-cursor', () => ({
  withSyncCursor: async (
    _client: unknown,
    _step: unknown,
    fn: (ctx: { resumeCursor: undefined; onCursorAdvance: () => void }) => Promise<unknown>,
  ) => fn({ resumeCursor: undefined, onCursorAdvance: () => undefined }),
}));

vi.mock('@modules/resend/shared/utils/with-rate-limit-retry', () => ({
  withRateLimitRetry: async (fn: () => Promise<unknown>) => fn(),
}));

import { upsertRecords } from '@modules/resend/sync/utils/upsert-records';

const mockUpsertRecords = upsertRecords as unknown as ReturnType<typeof vi.fn>;

const SYNCED_AT = '2026-01-01T00:00:00.000Z';

const buildResend = (
  topicsList: Array<{
    id: string;
    name: string;
    description?: string;
    default_subscription: string;
    visibility?: string;
    created_at: string;
  }>,
): Resend =>
  ({
    topics: {
      list: vi.fn(async () => ({
        data: { data: topicsList },
        error: null,
      })),
    },
  }) as unknown as Resend;

const buildClient = (): CoreApiClient => ({}) as unknown as CoreApiClient;

describe('syncTopics', () => {
  beforeEach(() => {
    mockUpsertRecords.mockReset();
  });

  it('returns an empty id map when the API returns no topics', async () => {
    const resend = buildResend([]);
    const client = buildClient();

    const { result, value } = await syncTopics(resend, client, SYNCED_AT);

    expect(value.size).toBe(0);
    expect(result).toEqual({
      fetched: 0,
      created: 0,
      updated: 0,
      errors: [],
    });
    expect(mockUpsertRecords).not.toHaveBeenCalled();
  });

  it('upserts topics with the correct DTO and returns the resend->twenty id map', async () => {
    const resend = buildResend([
      {
        id: 'resend-topic-1',
        name: 'Weekly Newsletter',
        description: 'Weekly newsletter',
        default_subscription: 'opt_in',
        visibility: 'public',
        created_at: '2026-04-08T00:11:13.110779+00:00',
      },
    ]);
    const client = buildClient();

    mockUpsertRecords.mockResolvedValue({
      result: { fetched: 1, created: 1, updated: 0, errors: [] },
      ok: true,
      twentyIdByResendId: new Map([['resend-topic-1', 'twenty-topic-1']]),
    });

    const { value } = await syncTopics(resend, client, SYNCED_AT);

    expect(value.get('resend-topic-1')).toBe('twenty-topic-1');

    const upsertCall = mockUpsertRecords.mock.calls[0][0];
    const dto = upsertCall.mapCreateData(undefined, upsertCall.items[0]);

    expect(dto).toEqual({
      name: 'Weekly Newsletter',
      description: 'Weekly newsletter',
      defaultSubscription: 'OPT_IN',
      visibility: 'PUBLIC',
      createdAt: '2026-04-08T00:11:13.110Z',
      lastSyncedFromResend: SYNCED_AT,
    });
  });

  it('defaults visibility to PUBLIC when missing from the API response', async () => {
    const resend = buildResend([
      {
        id: 'resend-topic-2',
        name: 'No-visibility topic',
        default_subscription: 'opt_out',
        created_at: '2026-04-08T00:11:13.110779+00:00',
      },
    ]);
    const client = buildClient();

    mockUpsertRecords.mockResolvedValue({
      result: { fetched: 1, created: 1, updated: 0, errors: [] },
      ok: true,
      twentyIdByResendId: new Map(),
    });

    await syncTopics(resend, client, SYNCED_AT);

    const upsertCall = mockUpsertRecords.mock.calls[0][0];
    const dto = upsertCall.mapCreateData(undefined, upsertCall.items[0]);

    expect(dto.visibility).toBe('PUBLIC');
    expect(dto.defaultSubscription).toBe('OPT_OUT');
    expect(dto.description).toBe('');
  });

  it('throws when the Resend API returns an error', async () => {
    const resend = {
      topics: {
        list: vi.fn(async () => ({
          data: null,
          error: { message: 'boom' },
        })),
      },
    } as unknown as Resend;
    const client = buildClient();

    await expect(syncTopics(resend, client, SYNCED_AT)).rejects.toThrow(
      /Resend list\[topics\] failed/,
    );
  });
});
