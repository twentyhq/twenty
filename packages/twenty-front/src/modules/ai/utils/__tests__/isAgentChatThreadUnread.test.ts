import { isAgentChatThreadUnread } from '@/ai/utils/isAgentChatThreadUnread';

const participant = (lastReadAt: string | null) => ({
  lastReadAt,
  archivedAt: null,
  snoozedUntil: null,
});

describe('isAgentChatThreadUnread', () => {
  it('is read when the thread has no activity', () => {
    expect(isAgentChatThreadUnread(null, undefined)).toBe(false);
  });

  it('is unread when the member never opened the thread', () => {
    expect(isAgentChatThreadUnread('2026-10-01T10:00:00.000Z', undefined)).toBe(
      true,
    );
  });

  it('is unread when the member has state but never read it', () => {
    expect(
      isAgentChatThreadUnread('2026-10-01T10:00:00.000Z', participant(null)),
    ).toBe(true);
  });

  it('is read when the cursor is at the latest activity', () => {
    expect(
      isAgentChatThreadUnread(
        '2026-10-01T10:00:00.000Z',
        participant('2026-10-01T10:00:00.000Z'),
      ),
    ).toBe(false);
  });

  it('is unread when activity follows the cursor', () => {
    expect(
      isAgentChatThreadUnread(
        '2026-10-01T10:05:00.000Z',
        participant('2026-10-01T10:00:00.000Z'),
      ),
    ).toBe(true);
  });
});
