import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsOnNewAiChatSlot = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return threadId === newAiChatThreadId;
};
