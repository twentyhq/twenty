import { useAiChatThreadId } from '@/ai/hooks/useAiChatThreadId';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsOnNewAiChatSlot = () => {
  const currentAiChatThread = useAiChatThreadId();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return currentAiChatThread === newAiChatThreadId;
};
