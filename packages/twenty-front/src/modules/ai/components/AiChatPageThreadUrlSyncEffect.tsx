import { useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadDataSelector } from '@/ai/states/selectors/currentAiChatThreadDataSelector';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatPageThreadUrlSyncEffect = () => {
  const { threadId } = useParams();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const currentAiChatThreadData = useAtomStateValue(
    currentAiChatThreadDataSelector,
  );
  const metadataStoreAgentChatThreads = useAtomFamilyStateValue(
    metadataStoreState,
    'agentChatThreads',
  );
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
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

    if (
      metadataStoreAgentChatThreads.status === 'up-to-date' &&
      !isDefined(currentAiChatThreadData)
    ) {
      switchToNewChat();
    }
  }, [
    threadId,
    currentAiChatThread,
    currentAiChatThreadData,
    metadataStoreAgentChatThreads.status,
    switchThreadWithDraft,
    switchToNewChat,
  ]);

  return null;
};
