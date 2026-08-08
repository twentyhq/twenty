import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';

// A thread the user picked: it carries the draft across and the chat page's
// URL follows. Threads the user did not pick — one restored on startup, or
// one named by a browser history entry — go through
// useSwitchAgentChatThreadWithDraft directly and leave the URL alone.
export const useSelectAiChatThread = () => {
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();

  const selectAiChatThread = (toThreadId: string) => {
    switchThreadWithDraft(toThreadId);
    projectAiChatThreadToUrl(toThreadId);
  };

  return { selectAiChatThread };
};
