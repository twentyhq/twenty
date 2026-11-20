import { type NavigationMenuChatAttention } from '@/navigation-menu-item/common/types/NavigationMenuChatAttention';

export const getNavigationMenuChatAttention = ({
  needsInputThreadCount,
  hasUnreadMentionThread,
  hasUnreadAssignedThread,
}: {
  needsInputThreadCount: number;
  hasUnreadMentionThread: boolean;
  hasUnreadAssignedThread: boolean;
}): NavigationMenuChatAttention | null => {
  if (needsInputThreadCount > 0) {
    return 'needs-input';
  }

  return hasUnreadMentionThread || hasUnreadAssignedThread ? 'unread' : null;
};
