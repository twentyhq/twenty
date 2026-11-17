import { useAiChatInstance } from '@/ai/hooks/useAiChatInstance';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsOnNewAiChatSlot = () => {
  const { threadId: currentAiChatThread } = useAiChatInstance();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return currentAiChatThread === newAiChatThreadId;
};
