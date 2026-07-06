import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import {
  type AgentChatPrepromptMode,
  agentChatPrepromptState,
} from '@/ai/states/agentChatPrepromptState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useOpenAskAiPageWithPreprompt = () => {
  const { switchToNewChat } = useSwitchToNewAiChat();
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const setAgentChatPreprompt = useSetAtomState(agentChatPrepromptState);

  const openAskAiPageWithPreprompt = ({
    text,
    mode = 'PREFILL',
  }: {
    text: string;
    mode?: AgentChatPrepromptMode;
  }) => {
    switchToNewChat();
    setAgentChatDraftsByThreadId((prev) => ({
      ...prev,
      [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: text,
    }));
    setAgentChatPreprompt({
      text,
      mode,
      threadId: AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    });
  };

  return { openAskAiPageWithPreprompt };
};
