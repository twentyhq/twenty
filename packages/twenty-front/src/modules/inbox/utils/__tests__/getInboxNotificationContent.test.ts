import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { getInboxNotificationContent } from '@/inbox/utils/getInboxNotificationContent';

const ME = 'member-me';
const FELIX = 'member-felix';
const LAST_ACTIVITY_AT = '2026-11-16T10:00:00.000Z';

const workspaceMembers = [
  {
    id: FELIX,
    name: { firstName: 'Felix', lastName: 'Martin' },
    userEmail: 'felix@example.com',
    avatarUrl: '',
  },
  {
    id: ME,
    name: { firstName: 'Grace', lastName: 'Hopper' },
    userEmail: 'grace@example.com',
    avatarUrl: '',
  },
];

const channelThread = {
  id: 'thread-1',
  title: 'Roadmap',
  conversationType: AgentChatThreadConversationType.STANDARD,
  directMessageFirstWorkspaceMemberId: null,
  directMessageSecondWorkspaceMemberId: null,
  lastActivityAt: LAST_ACTIVITY_AT,
  lastMessageText: 'Ship it on Friday',
  lastMessageSenderWorkspaceMemberId: FELIX,
};

const getContent = (
  overrides: Partial<Parameters<typeof getInboxNotificationContent>[0]>,
) =>
  getInboxNotificationContent({
    thread: channelThread,
    workspaceMembers,
    currentWorkspaceMemberId: ME,
    assistantDisplayName: 'Assistant',
    isPreviewEnabled: true,
    ...overrides,
  });

describe('getInboxNotificationContent', () => {
  it('should name the sender and the chat for a chat message', () => {
    expect(getContent({})).toEqual({
      title: 'Felix Martin in Roadmap',
      options: {
        body: 'Ship it on Friday',
        icon: '/images/icons/android/android-launchericon-192-192.png',
        tag: `inbox-thread-1-${LAST_ACTIVITY_AT}`,
      },
    });
  });

  it('should only name the other member for a direct message', () => {
    expect(
      getContent({
        thread: {
          ...channelThread,
          title: null,
          conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
          directMessageFirstWorkspaceMemberId: FELIX,
          directMessageSecondWorkspaceMemberId: ME,
        },
      }).title,
    ).toBe('Felix Martin');
  });

  it('should only name the chat for a message from the assistant', () => {
    expect(
      getContent({
        thread: { ...channelThread, lastMessageSenderWorkspaceMemberId: null },
      }).title,
    ).toBe('Roadmap');
  });

  it('should hide the message text when the preview is off', () => {
    expect(getContent({ isPreviewEnabled: false }).options.body).toBe(
      'New message',
    );
  });
});
