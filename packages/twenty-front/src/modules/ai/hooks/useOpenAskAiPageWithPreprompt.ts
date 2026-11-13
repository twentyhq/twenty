import { useStore } from 'jotai';
import { type AiModelTier } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { useInboxFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import { useStageAiChatPreprompt } from '@/ai/hooks/useStageAiChatPreprompt';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { type AgentChatPrepromptMode } from '@/ai/states/agentChatPrepromptState';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { inboxUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
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
  const { uploadFiles } = useInboxFileUpload();
  const setInboxUploadedFiles = useSetAtomState(inboxUploadedFilesState);

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
  }): Promise<string | null> => {
    const newInboxThreadId = switchToNewChat();

    if (isDefined(model)) {
      const tier = TIER_BY_PRESELECTION[model];

      // null keeps following the workspace, so a later change there applies.
      setAgentChatUserSelectedModelTier(tier === chatTier ? null : tier);
    }

    if (!isNonEmptyArray(files)) {
      stageAiChatPreprompt({ serializedDocument, mode });

      return newInboxThreadId;
    }

    const threadId = store.get(currentInboxThreadState.atom);

    const uploadedFiles = await uploadFiles(files);

    if (store.get(currentInboxThreadState.atom) !== threadId) {
      setInboxUploadedFiles((previousUploadedFiles) =>
        previousUploadedFiles.filter(
          (uploadedFile) => !uploadedFiles.includes(uploadedFile),
        ),
      );

      return null;
    }

    stageAiChatPreprompt({
      serializedDocument,
      mode: isNonEmptyArray(uploadedFiles) ? mode : 'PREFILL',
    });

    return newInboxThreadId;
  };

  return { openAskAiPageWithPreprompt };
};
