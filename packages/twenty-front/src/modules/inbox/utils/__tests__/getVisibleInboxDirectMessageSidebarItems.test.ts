import { type InboxDirectMessageSidebarItem } from '@/inbox/types/InboxDirectMessageSidebarItem';
import { getVisibleInboxDirectMessageSidebarItems } from '@/inbox/utils/getVisibleInboxDirectMessageSidebarItems';

const buildDirectMessage = ({
  threadId,
  isUnread = false,
}: {
  threadId: string;
  isUnread?: boolean;
}): InboxDirectMessageSidebarItem => ({
  threadId,
  peer: null,
  isUnread,
});

describe('getVisibleInboxDirectMessageSidebarItems', () => {
  it('keeps the first direct messages, plus unread ones and the open one past the cap', () => {
    const directMessages = [
      buildDirectMessage({ threadId: 'first' }),
      buildDirectMessage({ threadId: 'second' }),
      buildDirectMessage({ threadId: 'hidden' }),
      buildDirectMessage({ threadId: 'unread', isUnread: true }),
      buildDirectMessage({ threadId: 'open' }),
    ];

    expect(
      getVisibleInboxDirectMessageSidebarItems({
        directMessages,
        currentThreadId: 'open',
        maxCount: 2,
      }).map(({ threadId }) => threadId),
    ).toEqual(['first', 'second', 'unread', 'open']);
  });
});
