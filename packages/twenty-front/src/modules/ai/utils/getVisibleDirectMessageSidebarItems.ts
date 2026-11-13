import { type DirectMessageSidebarItem } from '@/ai/types/DirectMessageSidebarItem';

export const getVisibleDirectMessageSidebarItems = ({
  directMessages,
  currentThreadId,
  maxCount,
}: {
  directMessages: readonly DirectMessageSidebarItem[];
  currentThreadId: string | null;
  maxCount: number;
}) =>
  directMessages.filter(
    (directMessage, index) =>
      index < maxCount ||
      directMessage.isUnread ||
      directMessage.threadId === currentThreadId,
  );
