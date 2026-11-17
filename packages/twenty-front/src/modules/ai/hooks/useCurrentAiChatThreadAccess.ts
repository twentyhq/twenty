import { useAiChatInstance } from '@/ai/hooks/useAiChatInstance';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { aiChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/aiChatThreadPermissionsFamilySelector';
import { getAiChatThreadAccess } from '@/ai/utils/getAiChatThreadAccess';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useCurrentAiChatThreadAccess = () => {
  const { threadId: currentAiChatThread } = useAiChatInstance();
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();
  const permissions = useAtomFamilySelectorValue(
    aiChatThreadPermissionsFamilySelector,
    currentAiChatThread ?? '',
  );

  // Before the chat list picks a chat, the composer writes to the new one
  return getAiChatThreadAccess({
    isOnNewAiChatSlot: isOnNewAiChatSlot || currentAiChatThread === null,
    permissions,
  });
};
