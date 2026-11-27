import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useIsOnNewAiChatSlot } from '@/ai-chat/hooks/useIsOnNewAiChatSlot';
import { aiChatThreadPermissionsFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadPermissionsFamilySelector';
import { getAiChatThreadAccess } from '@/ai-chat/threads/utils/getAiChatThreadAccess';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useCurrentAiChatThreadAccess = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();
  const permissions = useAtomFamilySelectorValue(
    aiChatThreadPermissionsFamilySelector,
    threadId,
  );

  return getAiChatThreadAccess({ isOnNewAiChatSlot, permissions });
};
