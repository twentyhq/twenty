import { mergeAgentChatThreadParticipants } from '@/ai/utils/mergeAgentChatThreadParticipants';

const READ_PARTICIPANT = {
  threadId: 'thread',
  lastReadAt: '2026-10-01T10:00:00.000Z',
  archivedAt: null,
  snoozedUntil: null,
  hasSnoozeEnded: false,
  updatedAt: '2026-10-01T10:00:00.000Z',
};

describe('mergeAgentChatThreadParticipants', () => {
  it('takes a newer copy and leaves the other threads alone', () => {
    const otherParticipant = { ...READ_PARTICIPANT, threadId: 'other' };
    const unreadParticipant = {
      ...READ_PARTICIPANT,
      lastReadAt: null,
      updatedAt: '2026-10-01T10:05:00.000Z',
    };

    expect(
      mergeAgentChatThreadParticipants(
        { thread: READ_PARTICIPANT, other: otherParticipant },
        [unreadParticipant],
      ),
    ).toEqual({ thread: unreadParticipant, other: otherParticipant });
  });

  it('takes a copy as recent as the one it has, like a snooze that ends', () => {
    const snoozeEndedParticipant = {
      ...READ_PARTICIPANT,
      hasSnoozeEnded: true,
    };

    expect(
      mergeAgentChatThreadParticipants({ thread: READ_PARTICIPANT }, [
        snoozeEndedParticipant,
      ]),
    ).toEqual({ thread: snoozeEndedParticipant });
  });

  it('keeps what it has over an older copy', () => {
    expect(
      mergeAgentChatThreadParticipants({ thread: READ_PARTICIPANT }, [
        {
          ...READ_PARTICIPANT,
          lastReadAt: null,
          updatedAt: '2026-10-01T09:59:00.000Z',
        },
      ]),
    ).toEqual({ thread: READ_PARTICIPANT });
  });
});
