import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { getAiChatThreadAccess } from '@/ai/utils/getAiChatThreadAccess';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentAiChatThreadAccess = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();
  const permissions = useAtomFamilySelectorValue(
    agentChatThreadPermissionsFamilySelector,
    currentAiChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  );

  return getAiChatThreadAccess({
    currentAiChatThread,
    isOnNewAiChatSlot,
    permissions,
  });
};
