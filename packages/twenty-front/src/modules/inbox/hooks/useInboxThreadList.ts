import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { inboxThreadListThreadsFamilySelector } from '@/inbox/states/selectors/inboxThreadListThreadsFamilySelector';
import { type InboxThreadListSource } from '@/inbox/types/InboxThreadListSource';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useInboxThreadList = (source: InboxThreadListSource) => {
  const threads = useAtomFamilySelectorValue(
    inboxThreadListThreadsFamilySelector,
    source,
  );
  const inboxThreadList = useAtomFamilyStateValue(
    inboxThreadListFamilyState,
    getInboxThreadListSourceKey(source),
  );

  const sortedThreads = useMemo(
    () => sortChatThreadsByLastActivityDesc(threads),
    [threads],
  );

  return {
    threads: sortedThreads,
    inboxThreadList,
    isLoading: !isDefined(inboxThreadList),
  };
};
