import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { aiChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/aiChatThreadPermissionsFamilySelector';
import { getAiChatThreadAccess } from '@/ai/utils/getAiChatThreadAccess';
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
