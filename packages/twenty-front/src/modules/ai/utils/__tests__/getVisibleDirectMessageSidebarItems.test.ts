import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';
import { getVisibleDirectMessageSidebarItems } from '@/ai/utils/getVisibleDirectMessageSidebarItems';

const buildDirectMessage = ({
  threadId,
  isUnread = false,
}: {
  threadId: string;
  isUnread?: boolean;
}): DirectMessageSidebarItem => ({
  threadId,
  peer: null,
  isUnread,
});

describe('getVisibleDirectMessageSidebarItems', () => {
  it('keeps the first direct messages, plus unread ones and the open one past the cap', () => {
    const directMessages = [
      buildDirectMessage({ threadId: 'first' }),
      buildDirectMessage({ threadId: 'second' }),
      buildDirectMessage({ threadId: 'hidden' }),
      buildDirectMessage({ threadId: 'unread', isUnread: true }),
      buildDirectMessage({ threadId: 'open' }),
    ];

    expect(
      getVisibleDirectMessageSidebarItems({
        directMessages,
        currentThreadId: 'open',
        maxCount: 2,
      }).map(({ threadId }) => threadId),
    ).toEqual(['first', 'second', 'unread', 'open']);
  });
});
