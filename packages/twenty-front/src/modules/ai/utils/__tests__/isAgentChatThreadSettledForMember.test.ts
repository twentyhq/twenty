import { isAgentChatThreadSettledForMember } from '@/ai/utils/isAgentChatThreadSettledForMember';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

const MEMBER_ID = 'member';
const OTHER_MEMBER_ID = 'other-member';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const SETTLED_THREAD: Parameters<
  typeof isAgentChatThreadSettledForMember
>[0]['thread'] = {
  deletedAt: null,
  lastActivityAt: LAST_ACTIVITY_AT,
  lastMessageSenderWorkspaceMemberId: null,
  workspaceMemberId: MEMBER_ID,
  assigneeId: null,
  pendingQuestionMessageId: null,
};

const READ_PARTICIPANT: AgentChatThreadParticipantFieldsFragment = {
  id: 'participant',
  threadId: 'thread',
  lastReadAt: LAST_ACTIVITY_AT,
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  updatedAt: LAST_ACTIVITY_AT,
};

const isSettled = ({
  thread = {},
  participant = {},
}: {
  thread?: Partial<typeof SETTLED_THREAD>;
  participant?: Partial<typeof READ_PARTICIPANT>;
} = {}) =>
  isAgentChatThreadSettledForMember({
    thread: { ...SETTLED_THREAD, ...thread },
    participant: { ...READ_PARTICIPANT, ...participant },
    workspaceMemberId: MEMBER_ID,
  });

describe('isAgentChatThreadSettledForMember', () => {
  it('settles a read chat of the member where the agent had the last word', () => {
    expect(isSettled()).toBe(true);
  });

  it('keeps a chat the member has not read yet', () => {
    expect(
      isSettled({ participant: { lastReadAt: '2026-10-01T09:00:00.000Z' } }),
    ).toBe(false);
  });

  it('keeps a chat waiting on an answer from the member', () => {
    expect(isSettled({ thread: { pendingQuestionMessageId: 'message' } })).toBe(
      false,
    );
  });

  it('keeps a chat where a member wrote last', () => {
    expect(
      isSettled({ thread: { lastMessageSenderWorkspaceMemberId: MEMBER_ID } }),
    ).toBe(false);
  });

  it('keeps a chat started by another member', () => {
    expect(isSettled({ thread: { workspaceMemberId: OTHER_MEMBER_ID } })).toBe(
      false,
    );
  });

  it('keeps a chat assigned to the member', () => {
    expect(isSettled({ thread: { assigneeId: MEMBER_ID } })).toBe(false);
  });

  it('leaves alone a chat already out of the inbox', () => {
    expect(
      isSettled({ participant: { archivedAt: '2026-10-01T11:00:00.000Z' } }),
    ).toBe(false);
    expect(
      isSettled({
        participant: {
          isSubscribed: false,
          archivedAt: '2026-10-01T11:00:00.000Z',
        },
      }),
    ).toBe(false);
  });
});
