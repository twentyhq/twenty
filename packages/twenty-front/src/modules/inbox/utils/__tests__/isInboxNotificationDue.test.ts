import {
  type AgentChatInboxState,
  AgentChatThreadConversationType,
} from 'twenty-shared/ai';

import { isInboxNotificationDue } from '@/inbox/utils/isInboxNotificationDue';
import { INBOX_NOTIFICATION_LEVEL } from '@/inbox/constants/InboxNotificationLevel';

const ME = 'member-me';
const FELIX = 'member-felix';
const LAST_ACTIVITY_AT = '2026-11-16T10:00:00.000Z';

const channelThread = {
  id: 'thread-1',
  deletedAt: null,
  lastActivityAt: LAST_ACTIVITY_AT,
  lastMessageSenderWorkspaceMemberId: FELIX,
  conversationType: AgentChatThreadConversationType.STANDARD,
  directMessageFirstWorkspaceMemberId: null,
  directMessageSecondWorkspaceMemberId: null,
  assigneeId: null,
};

const directMessageThread = {
  ...channelThread,
  conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
  directMessageFirstWorkspaceMemberId: FELIX,
  directMessageSecondWorkspaceMemberId: ME,
};

const unreadFollowedParticipant: AgentChatInboxState = {
  lastReadAt: '2026-11-16T09:00:00.000Z',
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  mentionsResolvedAt: null,
};

const isDue = (
  overrides: Partial<Parameters<typeof isInboxNotificationDue>[0]>,
) =>
  isInboxNotificationDue({
    thread: channelThread,
    participant: unreadFollowedParticipant,
    currentWorkspaceMemberId: ME,
    inboxNotificationLevel: INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED,
    ...overrides,
  });

describe('isInboxNotificationDue', () => {
  it('should notify for an unread message in a followed chat', () => {
    expect(isDue({})).toBe(true);
  });

  it('should notify for a message from the assistant', () => {
    expect(
      isDue({
        thread: { ...channelThread, lastMessageSenderWorkspaceMemberId: null },
      }),
    ).toBe(true);
  });

  it('should not notify for my own message', () => {
    expect(
      isDue({
        thread: { ...channelThread, lastMessageSenderWorkspaceMemberId: ME },
      }),
    ).toBe(false);
  });

  it('should not notify for a deleted chat', () => {
    expect(
      isDue({ thread: { ...channelThread, deletedAt: LAST_ACTIVITY_AT } }),
    ).toBe(false);
  });

  it('should not notify for a message already read', () => {
    expect(
      isDue({
        participant: {
          ...unreadFollowedParticipant,
          lastReadAt: LAST_ACTIVITY_AT,
        },
      }),
    ).toBe(false);
  });

  it('should not notify for a chat I do not follow', () => {
    expect(
      isDue({
        participant: { ...unreadFollowedParticipant, isSubscribed: false },
      }),
    ).toBe(false);
  });

  it('should notify for a direct message that arrives before its participant row', () => {
    expect(isDue({ thread: directMessageThread, participant: undefined })).toBe(
      true,
    );
  });

  it('should notify for a mention in a chat I do not follow', () => {
    expect(
      isDue({
        participant: {
          ...unreadFollowedParticipant,
          isSubscribed: false,
          lastMentionedAt: LAST_ACTIVITY_AT,
        },
      }),
    ).toBe(true);
  });

  it('should only notify for direct messages, mentions and assigned chats when the level asks for it', () => {
    const inboxNotificationLevel = INBOX_NOTIFICATION_LEVEL.DIRECT_AND_MENTIONS;

    expect(isDue({ inboxNotificationLevel })).toBe(false);
    expect(isDue({ inboxNotificationLevel, thread: directMessageThread })).toBe(
      true,
    );
    expect(
      isDue({
        inboxNotificationLevel,
        thread: { ...channelThread, assigneeId: ME },
      }),
    ).toBe(true);
  });

  it('should never notify when notifications are off', () => {
    expect(
      isDue({
        inboxNotificationLevel: INBOX_NOTIFICATION_LEVEL.NONE,
        thread: directMessageThread,
      }),
    ).toBe(false);
  });
});
