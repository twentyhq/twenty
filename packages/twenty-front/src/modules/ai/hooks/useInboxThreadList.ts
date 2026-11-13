import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { inboxThreadListFamilyState } from '@/ai/states/inboxThreadListFamilyState';
import { inboxThreadListThreadsFamilySelector } from '@/ai/states/selectors/inboxThreadListThreadsFamilySelector';
import { type InboxThreadListSource } from '@/ai/types/InboxThreadListSource';
import { getInboxThreadListSourceKey } from '@/ai/utils/getInboxThreadListSourceKey';
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
