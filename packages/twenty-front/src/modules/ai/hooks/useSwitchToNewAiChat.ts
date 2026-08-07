import { useStartNewAiChatDraft } from '@/ai/hooks/useStartNewAiChatDraft';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';

export const useSwitchToNewAiChat = () => {
  const { startNewAiChatDraft } = useStartNewAiChatDraft();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const switchToNewChat = () => {
    startNewAiChatDraft({ open: () => openAskAiPage() });
  };

  return { switchToNewChat };
};
