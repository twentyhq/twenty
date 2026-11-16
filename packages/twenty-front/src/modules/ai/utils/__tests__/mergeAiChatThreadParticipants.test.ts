import { mergeAiChatThreadParticipants } from '@/ai/utils/mergeAiChatThreadParticipants';

const READ_PARTICIPANT = {
  __typename: 'AgentChatThreadParticipant' as const,
  id: 'participant',
  threadId: 'thread',
  lastReadAt: '2026-10-01T10:00:00.000Z',
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  mentionsResolvedAt: null,
  updatedAt: '2026-10-01T10:00:00.000Z',
};

describe('mergeAiChatThreadParticipants', () => {
  it('takes a newer copy and leaves the other threads alone', () => {
    const otherParticipant = { ...READ_PARTICIPANT, threadId: 'other' };
    const unreadParticipant = {
      ...READ_PARTICIPANT,
      lastReadAt: null,
      updatedAt: '2026-10-01T10:05:00.000Z',
    };

    expect(
      mergeAiChatThreadParticipants(
        { thread: READ_PARTICIPANT, other: otherParticipant },
        [unreadParticipant],
      ),
    ).toEqual({ thread: unreadParticipant, other: otherParticipant });
  });

  it('takes a copy as recent as the one it has, like one a change was applied to', () => {
    const changedParticipant = { ...READ_PARTICIPANT, lastReadAt: null };

    expect(
      mergeAiChatThreadParticipants({ thread: READ_PARTICIPANT }, [
        changedParticipant,
      ]),
    ).toEqual({ thread: changedParticipant });
  });

  it('keeps what it has over an older copy', () => {
    expect(
      mergeAiChatThreadParticipants({ thread: READ_PARTICIPANT }, [
        {
          ...READ_PARTICIPANT,
          lastReadAt: null,
          updatedAt: '2026-10-01T09:59:00.000Z',
        },
      ]),
    ).toEqual({ thread: READ_PARTICIPANT });
  });
});
