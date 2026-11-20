import { useEffect } from 'react';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';

type NavigationMenuAiChatRecentsFetchMoreEffectProps = {
  shouldFetchMore: boolean;
  endCursor: string | null | undefined;
};

export const NavigationMenuAiChatRecentsFetchMoreEffect = ({
  shouldFetchMore,
  endCursor,
}: NavigationMenuAiChatRecentsFetchMoreEffectProps) => {
  const { loadInboxThreadList } = useLoadInboxThreadList();

  useEffect(() => {
    if (shouldFetchMore) {
      void loadInboxThreadList({
        source: INBOX_RECENT_THREAD_LIST_SOURCE,
        mode: 'fetch-more',
      });
    }
  }, [shouldFetchMore, endCursor, loadInboxThreadList]);

  return null;
};
