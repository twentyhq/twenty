import { isDefined } from 'twenty-shared/utils';

import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import {
  type AgentChatPrepromptMode,
  agentChatPrepromptState,
} from '@/ai/states/agentChatPrepromptState';
import { agentChatUserSelectedModelState } from '@/ai/states/agentChatUserSelectedModelState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export type AgentChatModelPreselection = 'FAST' | 'SMART';

export const useOpenAskAiPageWithPreprompt = () => {
  const { switchToNewChat } = useSwitchToNewAiChat();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const setAgentChatPreprompt = useSetAtomState(agentChatPrepromptState);
  const setAgentChatUserSelectedModel = useSetAtomState(
    agentChatUserSelectedModelState,
  );

  const openAskAiPageWithPreprompt = ({
    text,
    mode = 'PREFILL',
    model,
  }: {
    text: string;
    mode?: AgentChatPrepromptMode;
    model?: AgentChatModelPreselection;
  }) => {
    switchToNewChat();

    if (isDefined(model)) {
      const fastModelId = currentWorkspace?.fastModel;

      setAgentChatUserSelectedModel(
        model === 'FAST' && isDefined(fastModelId) ? fastModelId : null,
      );
    }

    setAgentChatDraftsByThreadId((prev) => ({
      ...prev,
      [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: text,
    }));
    setAgentChatPreprompt({ text, mode });
  };

  return { openAskAiPageWithPreprompt };
};
