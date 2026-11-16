import { useEffect } from 'react';

import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const InboxCurrentThreadNotFoundEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId: currentAiChatThread,
  });
  const { loadInboxThreadList } = useLoadInboxThreadList();
  const isCurrentThreadNotFound = isGraphqlErrorOfType(
    aiChatError,
    'NOT_FOUND',
  );

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
