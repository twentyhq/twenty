import { useCallback } from 'react';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useLeaveRemovedInboxThread } from '@/inbox/hooks/useLeaveRemovedInboxThread';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { useRefreshInboxOpenThreadsSummary } from '@/inbox/hooks/useRefreshInboxOpenThreadsSummary';

export const useReloadInboxThreads = () => {
  const { loadInboxThreadList } = useLoadInboxThreadList();
  const { leaveRemovedInboxThread } = useLeaveRemovedInboxThread();
  const { refreshInboxOpenThreadsSummary } =
    useRefreshInboxOpenThreadsSummary();

  const refreshRecentThreads = useCallback(
    () =>
      loadInboxThreadList({
        source: INBOX_RECENT_THREAD_LIST_SOURCE,
        mode: 'refresh',
      }),
    [loadInboxThreadList],
  );

  const reloadThreads = useCallback(async () => {
    refreshInboxOpenThreadsSummary();
    await refreshRecentThreads();
    await leaveRemovedInboxThread();
  }, [
    leaveRemovedInboxThread,
    refreshInboxOpenThreadsSummary,
    refreshRecentThreads,
  ]);

  return { refreshRecentThreads, reloadThreads };
};
