import { getAgentChatThreadInboxStatus } from '@/ai/utils/getAgentChatThreadInboxStatus';

const THREAD_ID = 'thread';
const ARCHIVED_AT = '2026-10-01T10:00:00.000Z';

const getStatus = ({
  lastActivityAt = '2026-10-01T09:00:00.000Z',
  lastReadAt = lastActivityAt,
  archivedAt = null,
  snoozedUntil = null,
  hasSnoozeEnded = false,
}: {
  lastActivityAt?: string | null;
  lastReadAt?: string | null;
  archivedAt?: string | null;
  snoozedUntil?: string | null;
  hasSnoozeEnded?: boolean;
} = {}) =>
  getAgentChatThreadInboxStatus({
    lastActivityAt,
    participant: {
      threadId: THREAD_ID,
      lastReadAt,
      archivedAt,
      snoozedUntil,
      hasSnoozeEnded,
      updatedAt: ARCHIVED_AT,
    },
  });

describe('getAgentChatThreadInboxStatus', () => {
  it('keeps a thread nobody acted on in the inbox, unread', () => {
    expect(
      getAgentChatThreadInboxStatus({
        lastActivityAt: '2026-10-01T09:00:00.000Z',
        participant: undefined,
      }),
    ).toEqual({ scope: 'INBOX', isUnread: true, event: null });
  });

  it('reads a thread as read up to its read cursor', () => {
    expect(getStatus()).toEqual({
      scope: 'INBOX',
      isUnread: false,
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

  it('marks a thread done until activity follows the archive', () => {
    expect(getStatus({ archivedAt: ARCHIVED_AT })).toEqual({
      scope: 'ARCHIVED',
      isUnread: false,
      event: { type: 'DONE', at: ARCHIVED_AT },
    });
    expect(
      getStatus({ archivedAt: ARCHIVED_AT, lastActivityAt: ARCHIVED_AT }).scope,
    ).toBe('ARCHIVED');
    expect(
      getStatus({
        archivedAt: ARCHIVED_AT,
        lastActivityAt: '2026-10-01T11:00:00.000Z',
      }),
    ).toMatchObject({ scope: 'INBOX', event: null });
  });

  it('snoozes a thread until the server reports its snooze ended', () => {
    const snoozedUntil = '2026-10-02T09:00:00.000Z';

    expect(getStatus({ archivedAt: ARCHIVED_AT, snoozedUntil })).toMatchObject({
      scope: 'SNOOZED',
      event: { type: 'SNOOZED', at: snoozedUntil },
    });
    expect(
      getStatus({
        archivedAt: ARCHIVED_AT,
        snoozedUntil,
        hasSnoozeEnded: true,
      }),
    ).toMatchObject({
      scope: 'INBOX',
      event: { type: 'SNOOZE_ENDED', at: snoozedUntil },
    });
  });

  it('brings a snoozed thread back early when activity follows the snooze', () => {
    expect(
      getStatus({
        archivedAt: ARCHIVED_AT,
        snoozedUntil: '2026-10-02T09:00:00.000Z',
        lastActivityAt: '2026-10-01T11:00:00.000Z',
        lastReadAt: '2026-10-01T09:00:00.000Z',
      }),
    ).toEqual({ scope: 'INBOX', isUnread: true, event: null });
  });
});
