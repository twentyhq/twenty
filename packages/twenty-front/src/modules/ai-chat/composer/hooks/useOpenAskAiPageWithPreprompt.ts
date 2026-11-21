import { useStore } from 'jotai';
import { type AiModelTier } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { useAiChatFileUpload } from '@/ai-chat/composer/hooks/useAiChatFileUpload';
import { useApplyAiChatPreprompt } from '@/ai-chat/composer/hooks/useApplyAiChatPreprompt';
import { useSwitchToNewAiChat } from '@/ai-chat/composer/hooks/useSwitchToNewAiChat';
import { type AiChatPrepromptMode } from '@/ai-chat/types/AiChatPrepromptMode';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { aiChatComposerAttachmentsFamilyState } from '@/ai-chat/states/composer/aiChatComposerAttachmentsFamilyState';
import { aiChatRequiredThreadListenersState } from '@/ai-chat/states/aiChatRequiredThreadListenersState';
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
  const { applyAiChatPreprompt } = useApplyAiChatPreprompt();
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
      await applyAiChatPreprompt({
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
      store.get(aiChatRequiredThreadListenersState.atom),
    ).includes(newAiChatThreadId);

    if (!isNewChatStillOpen) {
      store.set(
        aiChatComposerAttachmentsFamilyState.atomFamily({
          threadId: newAiChatThreadId,
        }),
        (previousUploadedFiles) =>
          previousUploadedFiles.filter(
            (uploadedFile) => !uploadedFiles.includes(uploadedFile),
          ),
      );

      return null;
    }

    await applyAiChatPreprompt({
      threadId: newAiChatThreadId,
      serializedDocument,
      mode: isNonEmptyArray(uploadedFiles) ? mode : 'PREFILL',
    });

    return newAiChatThreadId;
  };

  return { openAskAiPageWithPreprompt };
};
