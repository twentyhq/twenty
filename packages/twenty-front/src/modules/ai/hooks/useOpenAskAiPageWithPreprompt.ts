import { type AiModelTier } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { useAiChatFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import { useStageAiChatPreprompt } from '@/ai/hooks/useStageAiChatPreprompt';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { type AgentChatPrepromptMode } from '@/ai/states/agentChatPrepromptState';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
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
  const { chatTier } = useWorkspaceAiModelTiers();
  const { uploadFiles } = useAiChatFileUpload();

  const openAskAiPageWithPreprompt = async ({
    serializedDocument,
    mode = 'PREFILL',
    model,
    files,
  }: {
    serializedDocument: string;
    mode?: AgentChatPrepromptMode;
    model?: AgentChatModelPreselection;
    files?: File[];
  }) => {
    switchToNewChat();

    if (isDefined(model)) {
      const tier = TIER_BY_PRESELECTION[model];

      // null keeps following the workspace, so a later change there applies.
      setAgentChatUserSelectedModelTier(tier === chatTier ? null : tier);
    }

    if (!isNonEmptyArray(files)) {
      stageAiChatPreprompt({ serializedDocument, mode });

      return;
    }

    const uploadedFiles = await uploadFiles(files);

    // A prompt about attachments must not go out without them
    stageAiChatPreprompt({
      serializedDocument,
      mode: isNonEmptyArray(uploadedFiles) ? mode : 'PREFILL',
    });
  };

  return { openAskAiPageWithPreprompt };
};
