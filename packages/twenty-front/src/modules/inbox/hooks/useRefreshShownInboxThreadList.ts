import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { isInboxPath } from '~/utils/isInboxPath';

export const useRefreshShownInboxThreadList = () => {
  const store = useStore();
  const { pathname } = useLocation();
  const { loadInboxThreadList } = useLoadInboxThreadList();

  const refreshShownInboxThreadList = useCallback(() => {
    const isRecentThreadListLoaded = isDefined(
      store.get(
        inboxThreadListFamilyState.atomFamily(
          getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
        ),
      ),
    );

    if (!isRecentThreadListLoaded || !isInboxPath(pathname)) {
      return;
    }

    void loadInboxThreadList({
      source: store.get(inboxSelectedThreadListSourceState.atom),
      mode: 'refresh',
    });
  }, [loadInboxThreadList, pathname, store]);

  return { refreshShownInboxThreadList };
};
