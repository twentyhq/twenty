import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { shouldSubmitChatEditorState } from '@/ai/states/shouldSubmitChatEditorState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export type AgentChatPrepromptMode = 'PREFILL' | 'SEND';

export const useOpenAskAiPageWithPreprompt = () => {
  const { switchToNewChat } = useSwitchToNewAiChat();
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const setShouldSubmitChatEditor = useSetAtomState(
    shouldSubmitChatEditorState,
  );

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
    setShouldSubmitChatEditor(mode === 'SEND');
  };

  return { openAskAiPageWithPreprompt };
};
