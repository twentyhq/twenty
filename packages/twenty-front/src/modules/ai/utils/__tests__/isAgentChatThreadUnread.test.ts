import { isAgentChatThreadUnread } from '@/ai/utils/isAgentChatThreadUnread';

const participant = (lastReadAt: string | null) => ({
  lastReadAt,
  archivedAt: null,
  snoozedUntil: null,
});

describe('isAgentChatThreadUnread', () => {
  it('is read when the thread has no activity', () => {
    expect(
      isAgentChatThreadUnread({ lastActivityAt: null, participant: null }),
    ).toBe(false);
  });

  it('is unread when the member never opened the thread', () => {
    expect(
      isAgentChatThreadUnread({
        lastActivityAt: '2026-10-01T10:00:00.000Z',
        participant: null,
      }),
    ).toBe(true);
  });

  it('is unread when the member has state but never read it', () => {
    expect(
      isAgentChatThreadUnread({
        lastActivityAt: '2026-10-01T10:00:00.000Z',
        participant: participant(null),
      }),
    ).toBe(true);
  });

  it('is read when the cursor is at the latest activity', () => {
    expect(
      isAgentChatThreadUnread({
        lastActivityAt: '2026-10-01T10:00:00.000Z',
        participant: participant('2026-10-01T10:00:00.000Z'),
      }),
    ).toBe(false);
  });

  it('is unread when activity follows the cursor', () => {
    expect(
      isAgentChatThreadUnread({
        lastActivityAt: '2026-10-01T10:05:00.000Z',
        participant: participant('2026-10-01T10:00:00.000Z'),
      }),
    ).toBe(true);
  });
});
