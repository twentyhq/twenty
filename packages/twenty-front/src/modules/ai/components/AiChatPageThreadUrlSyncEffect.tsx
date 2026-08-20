import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatPageThreadUrlSyncEffect = () => {
  const { threadId } = useParams();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();

  useEffect(() => {
    if (!isDefined(threadId) || !isValidUuid(threadId)) {
      return;
    }

    if (threadId === currentAiChatThread) {
      return;
    }

    switchThreadWithDraft(threadId);
  }, [threadId, currentAiChatThread, switchThreadWithDraft]);

  return null;
};
