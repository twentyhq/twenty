import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatDisplayedThreadId = () =>
  useAtomStateValue(aiChatDisplayedThreadState);
