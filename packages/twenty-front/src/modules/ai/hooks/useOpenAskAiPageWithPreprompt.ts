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

// Opens the Ask AI side panel on a fresh thread pre-filled with a given prompt.
// Use it from any frontend component to bootstrap a conversation. The mode
// controls whether the message is submitted automatically ('SEND') or left in
// the editor for the user to review and send themselves ('PREFILL').
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
    // Seed the new-thread draft before switching so the freshly mounted editor
    // renders the prompt and `handleSendMessage` can read it from the draft.
    setAgentChatDraftsByThreadId((prev) => ({
      ...prev,
      [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: text,
    }));
    setAgentChatPreprompt({ text, mode });
    switchToNewChat();
  };

  return { openAskAiPageWithPreprompt };
};
