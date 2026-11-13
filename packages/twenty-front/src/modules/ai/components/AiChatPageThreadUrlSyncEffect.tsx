import { useStore } from 'jotai';
import { useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { useLoadAgentChatThread } from '@/ai/hooks/useLoadAgentChatThread';
import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
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
  const areAgentChatThreadsLoaded = isDefined(
    useAtomFamilyStateValue(
      agentChatThreadListFamilyState,
      getAgentChatThreadListSourceKey(AGENT_CHAT_RECENT_THREAD_LIST_SOURCE),
    ),
  );
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const { loadAgentChatThread } = useLoadAgentChatThread();
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

    if (areAgentChatThreadsLoaded && !isDefined(currentAiChatThreadData)) {
      let isCurrentThread = true;

      void loadAgentChatThread(selectedThreadId).then((chatThread) => {
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
    areAgentChatThreadsLoaded,
    loadAgentChatThread,
    switchThreadWithDraft,
    switchToNewChat,
  ]);

  return null;
};
