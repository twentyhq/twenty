import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsOnNewAiChatSlot = () => {
  const { threadId: currentAiChatThread } = useAiChatInstanceOrThrow();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return currentAiChatThread === newAiChatThreadId;
};
