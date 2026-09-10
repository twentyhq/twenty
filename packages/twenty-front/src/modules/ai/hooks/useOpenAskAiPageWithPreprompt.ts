import { isDefined } from 'twenty-shared/utils';

import { useStageAiChatPreprompt } from '@/ai/hooks/useStageAiChatPreprompt';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { type AgentChatPrepromptMode } from '@/ai/states/agentChatPrepromptState';
import { agentChatUserSelectedModelState } from '@/ai/states/agentChatUserSelectedModelState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export type AgentChatModelPreselection = 'FAST' | 'SMART';

export const useOpenAskAiPageWithPreprompt = () => {
  const { switchToNewChat } = useSwitchToNewAiChat();
  const { stageAiChatPreprompt } = useStageAiChatPreprompt();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
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

    stageAiChatPreprompt({
      text,
      mode,
      draftKey: AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    });
  };

  return { openAskAiPageWithPreprompt };
};
