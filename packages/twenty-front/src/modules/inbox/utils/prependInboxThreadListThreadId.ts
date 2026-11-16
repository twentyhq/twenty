import { type InboxLoadedThreadList } from '@/inbox/types/InboxLoadedThreadList';

export const prependInboxThreadListThreadId = ({
  inboxThreadList,
  threadId,
}: {
  inboxThreadList: InboxLoadedThreadList;
  threadId: string;
}): InboxLoadedThreadList =>
  inboxThreadList.threadIds.includes(threadId)
    ? inboxThreadList
    : {
        ...inboxThreadList,
        threadIds: [threadId, ...inboxThreadList.threadIds],
      };
