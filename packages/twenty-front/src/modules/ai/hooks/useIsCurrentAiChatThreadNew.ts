import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsCurrentAiChatThreadNew = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return currentAiChatThread === newAiChatThreadId;
};
