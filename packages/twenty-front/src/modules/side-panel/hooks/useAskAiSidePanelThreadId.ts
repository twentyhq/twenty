import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { askAiSidePanelThreadIdComponentState } from '@/side-panel/states/askAiSidePanelThreadIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAskAiSidePanelThreadId = () => {
  const askAiSidePanelThreadId = useAtomComponentStateValue(
    askAiSidePanelThreadIdComponentState,
  );
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return askAiSidePanelThreadId ?? newAiChatThreadId;
};
