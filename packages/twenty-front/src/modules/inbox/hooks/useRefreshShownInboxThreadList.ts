import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';

export const useRefreshShownInboxThreadList = () => {
  const store = useStore();
  const { loadInboxThreadList } = useLoadInboxThreadList();

  const refreshShownInboxThreadList = useCallback(() => {
    const isRecentThreadListLoaded = isDefined(
      store.get(
        inboxThreadListFamilyState.atomFamily(
          getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
        ),
      ),
    );

    if (!isRecentThreadListLoaded) {
      return;
    }

    void loadInboxThreadList({
      source: store.get(inboxSelectedThreadListSourceState.atom),
      mode: 'refresh',
    });
  }, [loadInboxThreadList, store]);

  return { refreshShownInboxThreadList };
};
