import { type AiModelTier } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useStageAiChatPreprompt } from '@/ai/hooks/useStageAiChatPreprompt';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { type AgentChatPrepromptMode } from '@/ai/states/agentChatPrepromptState';
import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Kept coarse because it is part of the front component SDK surface.
export type AgentChatModelPreselection = 'FAST' | 'SMART';

const TIER_BY_PRESELECTION: Record<AgentChatModelPreselection, AiModelTier> = {
  FAST: 'fast',
  SMART: 'smart',
};

export const useOpenAskAiPageWithPreprompt = () => {
  const { switchToNewChat } = useSwitchToNewAiChat();
  const { stageAiChatPreprompt } = useStageAiChatPreprompt();
  const setAgentChatUserSelectedModelTier = useSetAtomState(
    agentChatUserSelectedModelTierState,
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
      setAgentChatUserSelectedModelTier(TIER_BY_PRESELECTION[model]);
    }

    stageAiChatPreprompt({
      text,
      mode,
      draftKey: AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    });
  };

  return { openAskAiPageWithPreprompt };
};
