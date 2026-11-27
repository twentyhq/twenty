import { useStore } from 'jotai';

import { useSendAiChatComposerMessage } from '@/ai-chat/composer/hooks/useSendAiChatComposerMessage';
import { writeAiChatPromptDraft } from '@/ai-chat/composer/utils/writeAiChatPromptDraft';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { type AiChatPrepromptMode } from '@/ai-chat/types/AiChatPrepromptMode';

export const useApplyAiChatPromptInChat = () => {
  const store = useStore();
  const { threadId } = useAiChatInstanceOrThrow();
  const { sendAiChatComposerMessage } = useSendAiChatComposerMessage();

  const applyAiChatPromptInChat = ({
    serializedDocument,
    mode,
  }: {
    serializedDocument: string;
    mode: AiChatPrepromptMode;
  }) => {
    writeAiChatPromptDraft({ store, threadId, serializedDocument });

    if (mode === 'SEND') {
      sendAiChatComposerMessage();

      return;
    }

    store.set(
      aiChatComposerShouldFocusFamilyState.atomFamily({ threadId }),
      true,
    );
  };

  return { applyAiChatPromptInChat };
};
