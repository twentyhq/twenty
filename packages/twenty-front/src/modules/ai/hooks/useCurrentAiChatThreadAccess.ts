import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
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
    currentAiChatThread ?? '',
  );

  // Before the chat list picks a chat, the composer writes to the new one
  return getAiChatThreadAccess({
    isOnNewAiChatSlot: isOnNewAiChatSlot || currentAiChatThread === null,
    permissions,
  });
};
