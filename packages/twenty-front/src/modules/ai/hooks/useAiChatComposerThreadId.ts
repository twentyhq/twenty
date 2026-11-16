import { useAiChatThreadId } from '@/ai/hooks/useAiChatThreadId';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatComposerThreadId = () => {
  const aiChatThreadId = useAiChatThreadId();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return aiChatThreadId ?? newAiChatThreadId;
};
