import { useInboxOpenThreadsSummaryQuery } from '@/inbox/hooks/useInboxOpenThreadsSummaryQuery';

const EMPTY_INBOX_OPEN_THREADS_SUMMARY = {
  openThreadCount: 0,
  unreadOpenThreadCount: 0,
  needsInputThreadCount: 0,
  mentionThreadCount: 0,
  assignedToMeThreadCount: 0,
  assignedThreadCount: 0,
  unassignedThreadCount: 0,
  hasUnreadOpenThread: false,
  hasUnreadMentionThread: false,
  hasUnreadAssignedThread: false,
};

export const useInboxOpenThreadsSummary = () => {
  const { data } = useInboxOpenThreadsSummaryQuery();

  return data?.agentChatOpenThreadsSummary ?? EMPTY_INBOX_OPEN_THREADS_SUMMARY;
};
