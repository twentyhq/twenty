import { useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadDataSelector } from '@/ai/states/selectors/currentAiChatThreadDataSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatPageThreadUrlSyncEffect = () => {
  const { threadId } = useParams();
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
    if (!isDefined(threadId) || !isValidUuid(threadId)) {
      return;
    }

    if (threadId !== currentAiChatThread) {
      switchThreadWithDraft(threadId);
      return;
    }

    if (areAgentChatThreadsLoaded && !isDefined(currentAiChatThreadData)) {
      let isCurrentThread = true;

      void loadAgentChatThread(threadId).then((chatThread) => {
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
    threadId,
    currentAiChatThread,
    currentAiChatThreadData,
    areAgentChatThreadsLoaded,
    loadAgentChatThread,
    switchThreadWithDraft,
    switchToNewChat,
  ]);

  return null;
};
