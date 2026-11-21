import { useStore } from 'jotai';

import { useSendAiChatMessage } from '@/ai-chat/composer/hooks/useSendAiChatMessage';
import { writeAiChatPromptDraft } from '@/ai-chat/composer/utils/writeAiChatPromptDraft';
import { useOpenAiChatThread } from '@/ai-chat/hooks/useOpenAiChatThread';
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { type AiChatPrepromptMode } from '@/ai-chat/types/AiChatPrepromptMode';

// Sending reads the draft, not the editor, so a prompt can be sent before its chat is on screen
export const useApplyAiChatPreprompt = () => {
  const store = useStore();
  const { sendAiChatMessage } = useSendAiChatMessage();
  const { openAiChatThread } = useOpenAiChatThread();

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

    if (mode === 'SEND') {
      void sendAiChatMessage({
        threadId,
        onThreadChange: (changedThreadId) =>
          openAiChatThread({ threadId: changedThreadId }),
      });

      return;
    }

    store.set(
      aiChatComposerShouldFocusFamilyState.atomFamily({ threadId }),
      true,
    );
  };

  return { applyAiChatPreprompt };
};
