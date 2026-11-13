import { useStore } from 'jotai';
import { useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { INBOX_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { useLoadInboxThread } from '@/ai/hooks/useLoadAgentChatThread';
import { useSwitchInboxThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { newInboxThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { currentInboxThreadDataSelector } from '@/ai/states/selectors/currentAiChatThreadDataSelector';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const InboxThreadPageThreadUrlSyncEffect = () => {
  const store = useStore();
  const { threadId } = useParams();
  const [newRouteThreadId] = useState(() =>
    store.get(newInboxThreadIdState.atom),
  );
  const isNewThreadRoute = threadId === INBOX_NEW_THREAD_PATH_SEGMENT;
  const selectedThreadId = isNewThreadRoute ? newRouteThreadId : threadId;
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const currentInboxThreadData = useAtomStateValue(
    currentInboxThreadDataSelector,
  );
  const areInboxThreadsLoaded = isDefined(
    useAtomFamilyStateValue(
      inboxThreadListFamilyState,
      getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
    ),
  );
  const { switchThreadWithDraft } = useSwitchInboxThreadWithDraft();
  const { loadInboxThread } = useLoadInboxThread();
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });

  useLayoutEffect(() => {
    if (!isDefined(selectedThreadId) || !isValidUuid(selectedThreadId)) {
      return;
    }

    if (selectedThreadId !== currentInboxThread) {
      switchThreadWithDraft(selectedThreadId);
      return;
    }

    if (isNewThreadRoute) {
      return;
    }

    if (areInboxThreadsLoaded && !isDefined(currentInboxThreadData)) {
      let isCurrentThread = true;

      void loadInboxThread(selectedThreadId).then((chatThread) => {
        if (!isCurrentThread || chatThread !== null) {
          return;
        }

        switchToNewChat();
      });

      return () => {
        isCurrentThread = false;
      };
    }
  }, [
    selectedThreadId,
    isNewThreadRoute,
    currentInboxThread,
    currentInboxThreadData,
    areInboxThreadsLoaded,
    loadInboxThread,
    switchThreadWithDraft,
    switchToNewChat,
  ]);

  return null;
};
