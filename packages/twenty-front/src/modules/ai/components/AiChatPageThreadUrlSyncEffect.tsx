import { useStore } from 'jotai';
import { useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { useLoadAiChatThread } from '@/ai/hooks/useLoadAgentChatThread';
import { useSwitchAiChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { currentAiChatThreadDataSelector } from '@/ai/states/selectors/currentAiChatThreadDataSelector';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatPageThreadUrlSyncEffect = () => {
  const store = useStore();
  const { threadId } = useParams();
  const [newRouteThreadId] = useState(() =>
    store.get(newAiChatThreadIdState.atom),
  );
  const isNewThreadRoute = threadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT;
  const selectedThreadId = isNewThreadRoute ? newRouteThreadId : threadId;
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const currentAiChatThreadData = useAtomStateValue(
    currentAiChatThreadDataSelector,
  );
  const areAiChatThreadsLoaded = isDefined(
    useAtomFamilyStateValue(
      inboxThreadListFamilyState,
      getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
    ),
  );
  const { switchThreadWithDraft } = useSwitchAiChatThreadWithDraft();
  const { loadAiChatThread } = useLoadAiChatThread();
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });

  useLayoutEffect(() => {
    if (!isDefined(selectedThreadId) || !isValidUuid(selectedThreadId)) {
      return;
    }

    if (selectedThreadId !== currentAiChatThread) {
      switchThreadWithDraft(selectedThreadId);
      return;
    }

    if (isNewThreadRoute) {
      return;
    }

    if (areAiChatThreadsLoaded && !isDefined(currentAiChatThreadData)) {
      let isCurrentThread = true;

      void loadAiChatThread(selectedThreadId).then((chatThread) => {
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
    currentAiChatThread,
    currentAiChatThreadData,
    areAiChatThreadsLoaded,
    loadAiChatThread,
    switchThreadWithDraft,
    switchToNewChat,
  ]);

  return null;
};
