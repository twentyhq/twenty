import { useStore } from 'jotai';

import { writeAiChatPromptDraft } from '@/ai-chat/composer/utils/writeAiChatPromptDraft';
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { aiChatComposerShouldSendFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldSendFamilyState';
import { type AiChatPrepromptMode } from '@/ai-chat/types/AiChatPrepromptMode';

export const useApplyAiChatPreprompt = () => {
  const store = useStore();

  const applyAiChatPreprompt = ({
    threadId,
    serializedDocument,
    mode,
  }: {
    threadId: string;
    serializedDocument: string;
    mode: AiChatPrepromptMode;
  }) => {
    writeAiChatPromptDraft({ store, threadId, serializedDocument });

    store.set(
      mode === 'SEND'
        ? aiChatComposerShouldSendFamilyState.atomFamily({ threadId })
        : aiChatComposerShouldFocusFamilyState.atomFamily({ threadId }),
      true,
    );
  };

  return { applyAiChatPreprompt };
};
