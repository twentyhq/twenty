import { type InboxDirectMessageSidebarItem } from '@/inbox/types/InboxDirectMessageSidebarItem';

export const getVisibleInboxDirectMessageSidebarItems = ({
  directMessages,
  currentThreadId,
  maxCount,
}: {
  directMessages: readonly InboxDirectMessageSidebarItem[];
  currentThreadId: string | null;
  maxCount: number;
}) =>
  directMessages.filter(
    (directMessage, index) =>
      index < maxCount ||
      directMessage.isUnread ||
      directMessage.threadId === currentThreadId,
  );
