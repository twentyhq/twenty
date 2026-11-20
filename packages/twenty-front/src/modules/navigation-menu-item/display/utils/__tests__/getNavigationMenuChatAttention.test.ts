import { getNavigationMenuChatAttention } from '@/navigation-menu-item/display/utils/getNavigationMenuChatAttention';

const NO_ATTENTION = {
  needsInputThreadCount: 0,
  hasUnreadMentionThread: false,
  hasUnreadAssignedThread: false,
};

describe('getNavigationMenuChatAttention', () => {
  it('asks for attention when a chat needs input', () => {
    expect(
      getNavigationMenuChatAttention({
        ...NO_ATTENTION,
        needsInputThreadCount: 1,
        hasUnreadMentionThread: true,
      }),
    ).toBe('needs-input');
  });

  it('marks an unread mention or assignment as unread', () => {
    expect(
      getNavigationMenuChatAttention({
        ...NO_ATTENTION,
        hasUnreadMentionThread: true,
      }),
    ).toBe('unread');
    expect(
      getNavigationMenuChatAttention({
        ...NO_ATTENTION,
        hasUnreadAssignedThread: true,
      }),
    ).toBe('unread');
  });

  it('asks for nothing otherwise', () => {
    expect(getNavigationMenuChatAttention(NO_ATTENTION)).toBeNull();
  });
});
