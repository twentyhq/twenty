import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';

export const useSelectAiChatThread = () => {
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();

  const selectAiChatThread = (toThreadId: string) => {
    switchThreadWithDraft(toThreadId);
    projectAiChatThreadToUrl(toThreadId);
  };

  return { selectAiChatThread };
};
