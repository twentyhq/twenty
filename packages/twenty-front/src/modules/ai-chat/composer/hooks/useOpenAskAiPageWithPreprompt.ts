import { useStore } from 'jotai';
import { type AiModelTier } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { useAiChatFileUpload } from '@/ai-chat/composer/hooks/useAiChatFileUpload';
import { useStageAiChatPreprompt } from '@/ai-chat/hooks/useStageAiChatPreprompt';
import { useSwitchToNewAiChat } from '@/ai-chat/composer/hooks/useSwitchToNewAiChat';
import { type AiChatPrepromptMode } from '@/ai-chat/states/aiChatPrepromptState';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { aiChatUploadedFilesFamilyState } from '@/ai-chat/composer/states/aiChatUploadedFilesFamilyState';
import { aiChatOpenThreadIdByInstanceIdState } from '@/ai-chat/states/aiChatOpenThreadIdByInstanceIdState';
import { aiChatUserSelectedModelTierState } from '@/ai-chat/states/aiChatUserSelectedModelTierState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Kept coarse because it is part of the front component SDK surface.
export type AiChatModelPreselection = 'FAST' | 'SMART';

const TIER_BY_PRESELECTION: Record<AiChatModelPreselection, AiModelTier> = {
  FAST: 'fast',
  SMART: 'smart',
};

export const useOpenAskAiPageWithPreprompt = () => {
  const store = useStore();
  const { switchToNewChat } = useSwitchToNewAiChat();
  const { stageAiChatPreprompt } = useStageAiChatPreprompt();
  const setAiChatUserSelectedModelTier = useSetAtomState(
    aiChatUserSelectedModelTierState,
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
    mode?: AiChatPrepromptMode;
    model?: AiChatModelPreselection;
    files?: File[];
  }): Promise<string | null> => {
    const newAiChatThreadId = switchToNewChat();

    if (isDefined(model)) {
      const tier = TIER_BY_PRESELECTION[model];

      // null keeps following the workspace, so a later change there applies.
      setAiChatUserSelectedModelTier(tier === chatTier ? null : tier);
    }

    if (!isNonEmptyArray(files)) {
      stageAiChatPreprompt({
        threadId: newAiChatThreadId,
        serializedDocument,
        mode,
      });

      return newAiChatThreadId;
    }

    const uploadedFiles = await uploadFiles({
      files,
      threadId: newAiChatThreadId,
    });

    const isNewChatStillOpen = Object.values(
      store.get(aiChatOpenThreadIdByInstanceIdState.atom),
    ).includes(newAiChatThreadId);

    if (!isNewChatStillOpen) {
      store.set(
        aiChatUploadedFilesFamilyState.atomFamily({
          threadId: newAiChatThreadId,
        }),
        (previousUploadedFiles) =>
          previousUploadedFiles.filter(
            (uploadedFile) => !uploadedFiles.includes(uploadedFile),
          ),
      );

      return null;
    }

    stageAiChatPreprompt({
      threadId: newAiChatThreadId,
      serializedDocument,
      mode: isNonEmptyArray(uploadedFiles) ? mode : 'PREFILL',
    });

    return newAiChatThreadId;
  };

  return { openAskAiPageWithPreprompt };
};
