import { useStore } from 'jotai';
import { type AiModelTier } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { useAiChatFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import { useStageAiChatPreprompt } from '@/ai/hooks/useStageAiChatPreprompt';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { type AgentChatPrepromptMode } from '@/ai/states/agentChatPrepromptState';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Kept coarse because it is part of the front component SDK surface.
export type AgentChatModelPreselection = 'FAST' | 'SMART';

const TIER_BY_PRESELECTION: Record<AgentChatModelPreselection, AiModelTier> = {
  FAST: 'fast',
  SMART: 'smart',
};

export const useOpenAskAiPageWithPreprompt = () => {
  const store = useStore();
  const { switchToNewChat } = useSwitchToNewAiChat();
  const { stageAiChatPreprompt } = useStageAiChatPreprompt();
  const setAgentChatUserSelectedModelTier = useSetAtomState(
    agentChatUserSelectedModelTierState,
  );
  const { chatTier } = useWorkspaceAiModelTiers();
  const { uploadFiles } = useAiChatFileUpload();
  const setAgentChatUploadedFiles = useSetAtomState(
    agentChatUploadedFilesState,
  );

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

    const threadId = store.get(currentAiChatThreadState.atom);

    const uploadedFiles = await uploadFiles(files);

    if (store.get(currentAiChatThreadState.atom) !== threadId) {
      setAgentChatUploadedFiles((previousUploadedFiles) =>
        previousUploadedFiles.filter(
          (uploadedFile) => !uploadedFiles.includes(uploadedFile),
        ),
      );

      return;
    }

    stageAiChatPreprompt({
      serializedDocument,
      mode: isNonEmptyArray(uploadedFiles) ? mode : 'PREFILL',
    });
  };

  return { openAskAiPageWithPreprompt };
};
