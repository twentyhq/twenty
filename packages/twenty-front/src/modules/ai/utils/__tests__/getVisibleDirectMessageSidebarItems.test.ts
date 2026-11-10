import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';
import { getVisibleDirectMessageSidebarItems } from '@/ai/utils/getVisibleDirectMessageSidebarItems';

const buildDirectMessage = (
  threadId: string,
  isUnread = false,
): DirectMessageSidebarItem => ({
  threadId,
  peer: null,
  isUnread,
});

describe('getVisibleDirectMessageSidebarItems', () => {
  it('keeps the first direct messages, plus unread ones and the open one past the cap', () => {
    const directMessages = [
      buildDirectMessage('first'),
      buildDirectMessage('second'),
      buildDirectMessage('hidden'),
      buildDirectMessage('unread', true),
      buildDirectMessage('open'),
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
