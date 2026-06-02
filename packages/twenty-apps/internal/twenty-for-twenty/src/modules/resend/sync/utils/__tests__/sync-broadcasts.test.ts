import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { syncBroadcasts } from '@modules/resend/sync/utils/sync-broadcasts';

vi.mock('@modules/resend/sync/utils/upsert-records', () => ({
  upsertRecords: vi.fn(),
}));

vi.mock('@modules/resend/sync/cursor/utils/with-sync-cursor', () => ({
  withSyncCursor: async (
    _client: unknown,
    _step: unknown,
    fn: (ctx: {
      resumeCursor: undefined;
      onCursorAdvance: (cursor: string) => Promise<void>;
    }) => Promise<unknown>,
  ) =>
    fn({
      resumeCursor: undefined,
      onCursorAdvance: async () => undefined,
    }),
}));

vi.mock('@modules/resend/shared/utils/with-rate-limit-retry', () => ({
  withRateLimitRetry: async (fn: () => Promise<unknown>) => fn(),
}));

vi.mock('@modules/resend/shared/utils/find-twenty-ids-by-resend-id', () => ({
  findTwentyIdsByResendId: vi.fn(),
}));

import { findTwentyIdsByResendId } from '@modules/resend/shared/utils/find-twenty-ids-by-resend-id';
import { upsertRecords } from '@modules/resend/sync/utils/upsert-records';

const mockUpsertRecords = upsertRecords as unknown as ReturnType<typeof vi.fn>;
const mockFindTwentyIdsByResendId =
  findTwentyIdsByResendId as unknown as ReturnType<typeof vi.fn>;

const buildResend = (pageBroadcasts: unknown[], detailById: Record<string, unknown>): Resend =>
  ({
    broadcasts: {
      list: vi.fn(async () => ({
        data: { data: pageBroadcasts, has_more: false },
        error: null,
      })),
      get: vi.fn(async (id: string) => ({
        data: detailById[id] ?? null,
        error: detailById[id] ? null : { message: 'not found' },
      })),
    },
  }) as unknown as Resend;

describe('syncBroadcasts', () => {
  beforeEach(() => {
    mockUpsertRecords.mockReset();
    mockFindTwentyIdsByResendId.mockReset();
  });

  it('captures html, text, and topicId from the broadcast detail', async () => {
    const broadcast = {
      id: 'broadcast-1',
      name: 'Announcements',
      segment_id: 'seg-1',
      status: 'draft',
      created_at: '2026-12-01T19:32:22.980Z',
      scheduled_at: null,
      sent_at: null,
    };

    const detail = {
      ...broadcast,
      from: 'Acme <onboarding@resend.dev>',
      subject: 'hello world',
      reply_to: null,
      preview_text: 'Check out our latest announcements',
      html: '<p>Hello!</p>',
      text: 'Hello!',
      topic_id: 'topic-1',
    };

    mockUpsertRecords.mockResolvedValue({
      result: { fetched: 1, created: 1, updated: 0, errors: [] },
      ok: true,
      twentyIdByResendId: new Map([['broadcast-1', 'twenty-broadcast-1']]),
    });

    mockFindTwentyIdsByResendId.mockImplementation(
      async (_client: unknown, plural: string) => {
        if (plural === 'resendSegments') {
          return new Map([['seg-1', 'twenty-seg-1']]);
        }

        if (plural === 'resendTopics') {
          return new Map([['topic-1', 'twenty-topic-1']]);
        }

        return new Map();
      },
    );

    const resend = buildResend([broadcast], { 'broadcast-1': detail });

    await syncBroadcasts(resend, {} as CoreApiClient);

    const upsertCall = mockUpsertRecords.mock.calls[0][0];
    const createDto = upsertCall.mapCreateData(undefined, broadcast);
    const updateDto = upsertCall.mapUpdateData(undefined, broadcast);

    expect(createDto).toMatchObject({
      htmlBody: '<p>Hello!</p>',
      textBody: 'Hello!',
      segmentId: 'twenty-seg-1',
      topicId: 'twenty-topic-1',
      subject: 'hello world',
      previewText: 'Check out our latest announcements',
    });

    expect(updateDto).toMatchObject({
      htmlBody: '<p>Hello!</p>',
      textBody: 'Hello!',
      segmentId: 'twenty-seg-1',
      topicId: 'twenty-topic-1',
    });
  });

  it('sets topicId to null when the broadcast has no topic_id (update)', async () => {
    const broadcast = {
      id: 'broadcast-2',
      name: 'No topic',
      segment_id: null,
      status: 'sent',
      created_at: '2026-12-01T19:32:22.980Z',
      scheduled_at: null,
      sent_at: '2026-12-02T00:00:00Z',
    };

    const detail = {
      ...broadcast,
      from: 'sender@example.com',
      subject: 'hi',
      reply_to: null,
      preview_text: '',
      html: '',
      text: '',
      topic_id: null,
    };

    mockUpsertRecords.mockResolvedValue({
      result: { fetched: 1, created: 0, updated: 1, errors: [] },
      ok: true,
      twentyIdByResendId: new Map(),
    });

    mockFindTwentyIdsByResendId.mockResolvedValue(new Map());

    const resend = buildResend([broadcast], { 'broadcast-2': detail });

    await syncBroadcasts(resend, {} as CoreApiClient);

    const upsertCall = mockUpsertRecords.mock.calls[0][0];
    const updateDto = upsertCall.mapUpdateData(undefined, broadcast);

    expect(updateDto.topicId).toBeNull();
    expect(updateDto.segmentId).toBeNull();
  });
});
