import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { syncEmails } from '@modules/resend/sync/utils/sync-emails';

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

vi.mock('@modules/resend/shared/utils/find-people-by-email', () => ({
  findPeopleByEmail: vi.fn(),
}));

vi.mock('@modules/resend/shared/utils/find-resend-contacts-by-email', () => ({
  findResendContactsByEmail: vi.fn(),
}));

vi.mock('@modules/resend/sync/utils/backfill-resend-contact-person-id', () => ({
  backfillResendContactPersonId: vi.fn(),
}));

vi.mock('@modules/resend/sync/utils/find-recent-sent-broadcasts', () => ({
  findRecentSentBroadcasts: vi.fn(),
}));

import { findPeopleByEmail } from '@modules/resend/shared/utils/find-people-by-email';
import { findResendContactsByEmail } from '@modules/resend/shared/utils/find-resend-contacts-by-email';
import { backfillResendContactPersonId } from '@modules/resend/sync/utils/backfill-resend-contact-person-id';
import { findRecentSentBroadcasts } from '@modules/resend/sync/utils/find-recent-sent-broadcasts';
import { upsertRecords } from '@modules/resend/sync/utils/upsert-records';

const mockUpsertRecords = upsertRecords as unknown as ReturnType<typeof vi.fn>;
const mockFindPeopleByEmail = findPeopleByEmail as unknown as ReturnType<
  typeof vi.fn
>;
const mockFindResendContactsByEmail =
  findResendContactsByEmail as unknown as ReturnType<typeof vi.fn>;
const mockBackfillResendContactPersonId =
  backfillResendContactPersonId as unknown as ReturnType<typeof vi.fn>;
const mockFindRecentSentBroadcasts =
  findRecentSentBroadcasts as unknown as ReturnType<typeof vi.fn>;

const SYNCED_AT = '2026-01-01T00:00:00.000Z';

const buildResend = (pageEmails: unknown[]): Resend =>
  ({
    emails: {
      list: vi.fn(async () => ({
        data: { data: pageEmails, has_more: false },
        error: null,
      })),
    },
  }) as unknown as Resend;

describe('syncEmails', () => {
  beforeEach(() => {
    mockUpsertRecords.mockReset();
    mockFindPeopleByEmail.mockReset();
    mockFindResendContactsByEmail.mockReset();
    mockBackfillResendContactPersonId.mockReset();
    mockBackfillResendContactPersonId.mockResolvedValue({
      updated: 0,
      errors: [],
    });
    mockFindRecentSentBroadcasts.mockReset();
    mockFindRecentSentBroadcasts.mockResolvedValue([]);
  });

  it('looks up people once per page and inlines personId into the upsert payload', async () => {
    const pageEmails = [
      {
        id: 'email-1',
        subject: 'hello',
        from: 'sender@example.com',
        to: ['matched@example.com'],
        cc: null,
        bcc: null,
        reply_to: null,
        last_event: 'delivered',
        created_at: '2026-01-01T00:00:00Z',
        scheduled_at: null,
      },
      {
        id: 'email-2',
        subject: 'world',
        from: 'sender@example.com',
        to: ['unmatched@example.com'],
        cc: null,
        bcc: null,
        reply_to: null,
        last_event: 'delivered',
        created_at: '2026-01-01T00:00:00Z',
        scheduled_at: null,
      },
    ];

    mockFindPeopleByEmail.mockResolvedValue(
      new Map([['matched@example.com', 'person-1']]),
    );
    mockFindResendContactsByEmail.mockResolvedValue(new Map());

    mockUpsertRecords.mockResolvedValue({
      result: { fetched: 2, created: 2, updated: 0, errors: [] },
      ok: true,
      twentyIdByResendId: new Map([
        ['email-1', 'twenty-email-1'],
        ['email-2', 'twenty-email-2'],
      ]),
    });

    const client = {} as CoreApiClient;
    const resend = buildResend(pageEmails);

    await syncEmails(resend, client, SYNCED_AT);

    expect(mockFindPeopleByEmail).toHaveBeenCalledTimes(1);
    expect(mockFindPeopleByEmail).toHaveBeenCalledWith(client, [
      'matched@example.com',
      'unmatched@example.com',
    ]);

    const upsertCall = mockUpsertRecords.mock.calls[0][0];

    expect(upsertCall.items).toBe(pageEmails);

    const matchedDto = upsertCall.mapCreateData(undefined, pageEmails[0]);
    const unmatchedDto = upsertCall.mapCreateData(undefined, pageEmails[1]);

    expect(matchedDto.personId).toBe('person-1');
    expect(unmatchedDto.personId).toBeUndefined();
  });

  it('inlines contactId in the upsert payload when a resend contact matches the primary recipient', async () => {
    const pageEmails = [
      {
        id: 'email-1',
        subject: 'hello',
        from: 'sender@example.com',
        to: ['matched@example.com'],
        cc: null,
        bcc: null,
        reply_to: null,
        last_event: 'delivered',
        created_at: '2026-01-01T00:00:00Z',
        scheduled_at: null,
      },
    ];

    mockFindPeopleByEmail.mockResolvedValue(new Map());
    mockFindResendContactsByEmail.mockResolvedValue(
      new Map([
        [
          'matched@example.com',
          { id: 'twenty-contact-1', personId: 'person-1' },
        ],
      ]),
    );

    mockUpsertRecords.mockResolvedValue({
      result: { fetched: 1, created: 1, updated: 0, errors: [] },
      ok: true,
      twentyIdByResendId: new Map([['email-1', 'twenty-email-1']]),
    });

    const client = {} as CoreApiClient;
    const resend = buildResend(pageEmails);

    await syncEmails(resend, client, SYNCED_AT);

    const upsertCall = mockUpsertRecords.mock.calls[0][0];
    const createDto = upsertCall.mapCreateData(undefined, pageEmails[0]);
    const updateDto = upsertCall.mapUpdateData(undefined, pageEmails[0]);

    expect(createDto.contactId).toBe('twenty-contact-1');
    expect(updateDto.contactId).toBe('twenty-contact-1');
  });

  it('backfills personId on matched resend contacts that have a null personId', async () => {
    const pageEmails = [
      {
        id: 'email-1',
        subject: 'hello',
        from: 'sender@example.com',
        to: ['matched@example.com'],
        cc: null,
        bcc: null,
        reply_to: null,
        last_event: 'delivered',
        created_at: '2026-01-01T00:00:00Z',
        scheduled_at: null,
      },
      {
        id: 'email-2',
        subject: 'hello again',
        from: 'sender@example.com',
        to: ['linked@example.com'],
        cc: null,
        bcc: null,
        reply_to: null,
        last_event: 'delivered',
        created_at: '2026-01-01T00:00:00Z',
        scheduled_at: null,
      },
    ];

    mockFindPeopleByEmail.mockResolvedValue(
      new Map([
        ['matched@example.com', 'person-matched'],
        ['linked@example.com', 'person-linked'],
      ]),
    );
    mockFindResendContactsByEmail.mockResolvedValue(
      new Map([
        ['matched@example.com', { id: 'contact-matched', personId: null }],
        [
          'linked@example.com',
          { id: 'contact-linked', personId: 'person-linked' },
        ],
      ]),
    );

    mockUpsertRecords.mockResolvedValue({
      result: { fetched: 2, created: 2, updated: 0, errors: [] },
      ok: true,
      twentyIdByResendId: new Map(),
    });

    const client = {} as CoreApiClient;
    const resend = buildResend(pageEmails);

    await syncEmails(resend, client, SYNCED_AT);

    expect(mockBackfillResendContactPersonId).toHaveBeenCalledTimes(1);

    const [, personIdByEmail] = mockBackfillResendContactPersonId.mock.calls[0];

    expect(personIdByEmail).toEqual(
      new Map([['matched@example.com', 'person-matched']]),
    );
  });

  it('inlines broadcastId on create/update when the email was sent within an hour after a broadcast', async () => {
    const broadcastSentAt = new Date('2026-01-01T10:00:00.000Z').getTime();
    const emailCreatedAt = '2026-01-01T10:30:00.000Z';
    const outOfWindowCreatedAt = '2026-01-01T12:00:00.000Z';

    const pageEmails = [
      {
        id: 'email-in-window',
        subject: 'hello',
        from: 'sender@example.com',
        to: ['matched@example.com'],
        cc: null,
        bcc: null,
        reply_to: null,
        last_event: 'delivered',
        created_at: emailCreatedAt,
        scheduled_at: null,
      },
      {
        id: 'email-out-of-window',
        subject: 'world',
        from: 'sender@example.com',
        to: ['matched@example.com'],
        cc: null,
        bcc: null,
        reply_to: null,
        last_event: 'delivered',
        created_at: outOfWindowCreatedAt,
        scheduled_at: null,
      },
    ];

    mockFindPeopleByEmail.mockResolvedValue(new Map());
    mockFindResendContactsByEmail.mockResolvedValue(new Map());
    mockFindRecentSentBroadcasts.mockResolvedValue([
      { id: 'twenty-broadcast-1', sentAtMs: broadcastSentAt },
    ]);

    mockUpsertRecords.mockResolvedValue({
      result: { fetched: 2, created: 2, updated: 0, errors: [] },
      ok: true,
      twentyIdByResendId: new Map(),
    });

    const client = {} as CoreApiClient;
    const resend = buildResend(pageEmails);

    await syncEmails(resend, client, SYNCED_AT);

    expect(mockFindRecentSentBroadcasts).toHaveBeenCalledTimes(1);
    expect(mockFindRecentSentBroadcasts).toHaveBeenCalledWith(client, {
      sinceIso: expect.any(String),
    });

    const upsertCall = mockUpsertRecords.mock.calls[0][0];

    const inWindowCreate = upsertCall.mapCreateData(undefined, pageEmails[0]);
    const inWindowUpdate = upsertCall.mapUpdateData(undefined, pageEmails[0]);
    const outOfWindowCreate = upsertCall.mapCreateData(undefined, pageEmails[1]);
    const outOfWindowUpdate = upsertCall.mapUpdateData(undefined, pageEmails[1]);

    expect(inWindowCreate.broadcastId).toBe('twenty-broadcast-1');
    expect(inWindowUpdate.broadcastId).toBe('twenty-broadcast-1');
    expect(outOfWindowCreate.broadcastId).toBeUndefined();
    expect(outOfWindowUpdate.broadcastId).toBeUndefined();
  });

  it('picks the broadcast closest in time when multiple broadcasts precede the email within the window', async () => {
    const earlierBroadcastSentAt = new Date(
      '2026-01-01T10:00:00.000Z',
    ).getTime();
    const closerBroadcastSentAt = new Date(
      '2026-01-01T10:45:00.000Z',
    ).getTime();
    const emailCreatedAt = '2026-01-01T11:00:00.000Z';

    const pageEmails = [
      {
        id: 'email-1',
        subject: 'hello',
        from: 'sender@example.com',
        to: ['matched@example.com'],
        cc: null,
        bcc: null,
        reply_to: null,
        last_event: 'delivered',
        created_at: emailCreatedAt,
        scheduled_at: null,
      },
    ];

    mockFindPeopleByEmail.mockResolvedValue(new Map());
    mockFindResendContactsByEmail.mockResolvedValue(new Map());
    mockFindRecentSentBroadcasts.mockResolvedValue([
      { id: 'broadcast-earlier', sentAtMs: earlierBroadcastSentAt },
      { id: 'broadcast-closer', sentAtMs: closerBroadcastSentAt },
    ]);

    mockUpsertRecords.mockResolvedValue({
      result: { fetched: 1, created: 1, updated: 0, errors: [] },
      ok: true,
      twentyIdByResendId: new Map(),
    });

    const client = {} as CoreApiClient;
    const resend = buildResend(pageEmails);

    await syncEmails(resend, client, SYNCED_AT);

    const upsertCall = mockUpsertRecords.mock.calls[0][0];
    const createDto = upsertCall.mapCreateData(undefined, pageEmails[0]);

    expect(createDto.broadcastId).toBe('broadcast-closer');
  });
});
