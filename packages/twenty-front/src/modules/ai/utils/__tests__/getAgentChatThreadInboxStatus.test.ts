import { getAgentChatThreadInboxStatus } from '@/ai/utils/getAgentChatThreadInboxStatus';

const THREAD_ID = 'thread';
const DONE_AT = '2026-10-01T10:00:00.000Z';

const getStatus = ({
  lastActivityAt = '2026-10-01T09:00:00.000Z',
  lastReadAt = lastActivityAt,
  doneAt = null,
  snoozedUntil = null,
  isSubscribed = true,
  lastMentionedAt = null,
}: {
  lastActivityAt?: string | null;
  lastReadAt?: string | null;
  doneAt?: string | null;
  snoozedUntil?: string | null;
  isSubscribed?: boolean;
  lastMentionedAt?: string | null;
} = {}) =>
  getAgentChatThreadInboxStatus({
    lastActivityAt,
    participant: {
      id: 'participant',
      threadId: THREAD_ID,
      lastReadAt,
      doneAt,
      snoozedUntil,
      isSubscribed,
      lastMentionedAt,
      updatedAt: DONE_AT,
    },
  });

describe('getAgentChatThreadInboxStatus', () => {
  it('keeps a thread nobody acted on in the inbox, unread', () => {
    expect(
      getAgentChatThreadInboxStatus({
        lastActivityAt: '2026-10-01T09:00:00.000Z',
        participant: undefined,
      }),
    ).toEqual({
      scope: 'INBOX',
      isUnread: true,
      isSubscribed: true,
      isMentioned: false,
      event: null,
    });
  });

  it('reads a thread as read up to its read cursor', () => {
    expect(getStatus()).toEqual({
      scope: 'INBOX',
      isUnread: false,
      isSubscribed: true,
      isMentioned: false,
      event: null,
    });
    expect(getStatus({ lastReadAt: '2026-10-01T08:00:00.000Z' }).isUnread).toBe(
      true,
    );
    expect(getStatus({ lastReadAt: null }).isUnread).toBe(true);
  });

  it('reads a thread without activity as read', () => {
    expect(getStatus({ lastActivityAt: null, lastReadAt: null }).isUnread).toBe(
      false,
    );
  });

  it('marks a thread done until activity follows it', () => {
    expect(getStatus({ doneAt: DONE_AT })).toEqual({
      scope: 'ARCHIVED',
      isUnread: false,
      isSubscribed: true,
      isMentioned: false,
      event: { type: 'DONE', at: DONE_AT },
    });
    expect(getStatus({ doneAt: DONE_AT, lastActivityAt: DONE_AT }).scope).toBe(
      'ARCHIVED',
    );
    expect(
      getStatus({
        doneAt: DONE_AT,
        lastActivityAt: '2026-10-01T11:00:00.000Z',
      }),
    ).toMatchObject({ scope: 'INBOX', event: null });
  });

  it('snoozes a thread until the server ends the snooze', () => {
    const snoozedUntil = '2026-10-02T09:00:00.000Z';

    expect(getStatus({ doneAt: DONE_AT, snoozedUntil })).toMatchObject({
      scope: 'SNOOZED',
      event: { type: 'SNOOZED', at: snoozedUntil },
    });
    expect(getStatus({ snoozedUntil })).toMatchObject({
      scope: 'INBOX',
      event: { type: 'SNOOZE_ENDED', at: snoozedUntil },
    });
  });

  it('stops showing an ended snooze once activity follows it', () => {
    expect(
      getStatus({
        snoozedUntil: '2026-10-02T09:00:00.000Z',
        lastActivityAt: '2026-10-02T10:00:00.000Z',
      }),
    ).toMatchObject({ scope: 'INBOX', event: null });
  });

  it('brings a snoozed thread back early when activity follows the snooze', () => {
    expect(
      getStatus({
        doneAt: DONE_AT,
        snoozedUntil: '2026-10-02T09:00:00.000Z',
        lastActivityAt: '2026-10-01T11:00:00.000Z',
        lastReadAt: '2026-10-01T09:00:00.000Z',
      }),
    ).toEqual({
      scope: 'INBOX',
      isUnread: true,
      isSubscribed: true,
      isMentioned: false,
      event: null,
    });
  });

  it('keeps an unsubscribed thread done whatever happens in it', () => {
    expect(
      getStatus({
        isSubscribed: false,
        doneAt: DONE_AT,
        lastActivityAt: '2026-10-01T11:00:00.000Z',
        lastReadAt: DONE_AT,
      }),
    ).toEqual({
      scope: 'ARCHIVED',
      isUnread: true,
      isSubscribed: false,
      isMentioned: false,
      event: { type: 'UNSUBSCRIBED', at: DONE_AT },
    });
  });

  it('tells when the member was mentioned', () => {
    expect(
      getStatus({ lastMentionedAt: '2026-10-01T09:00:00.000Z' }).isMentioned,
    ).toBe(true);
  });
});
