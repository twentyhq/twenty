import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadDataSelector } from '@/ai/states/selectors/currentAiChatThreadDataSelector';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useAddInboxThread } from '@/inbox/hooks/useAddInboxThread';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const InboxRecentThreadListSyncEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const currentAiChatThreadData = useAtomStateValue(
    currentAiChatThreadDataSelector,
  );
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId: currentAiChatThread,
  });
  const { prependInboxThreadToRecentList } = useAddInboxThread();
  const { loadInboxThreadList } = useLoadInboxThreadList();
  const fetchedCurrentThreadId = currentAiChatThreadData?.id;
  const isCurrentThreadNotFound = isGraphqlErrorOfType(
    aiChatError,
    'NOT_FOUND',
  );

  useEffect(() => {
    if (isDefined(fetchedCurrentThreadId)) {
      prependInboxThreadToRecentList(fetchedCurrentThreadId);
    }
  }, [fetchedCurrentThreadId, prependInboxThreadToRecentList]);

  useEffect(() => {
    if (isCurrentThreadNotFound) {
      void loadInboxThreadList({
        source: INBOX_RECENT_THREAD_LIST_SOURCE,
        mode: 'refresh',
      });
    }
  }, [isCurrentThreadNotFound, loadInboxThreadList]);

  return null;
};
