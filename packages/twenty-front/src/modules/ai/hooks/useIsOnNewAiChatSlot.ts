import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsOnNewAiChatSlot = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const threadIdCreatedFromDraft = useAtomStateValue(
    threadIdCreatedFromDraftState,
  );

  return (
    currentAiChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY ||
    (isDefined(threadIdCreatedFromDraft) &&
      currentAiChatThread === threadIdCreatedFromDraft)
  );
};
