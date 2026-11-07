import { useStore } from 'jotai';
import { useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { currentAiChatThreadDataSelector } from '@/ai/states/selectors/currentAiChatThreadDataSelector';
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
  const areAgentChatThreadsLoaded =
    useAtomStateValue(agentChatThreadListState) !== null;
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const { loadAgentChatThread } = useRefreshAgentChatThreads();
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
