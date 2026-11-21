import { useStore } from 'jotai';

import { useSendAiChatMessage } from '@/ai-chat/composer/hooks/useSendAiChatMessage';
import { writeAiChatPromptDraft } from '@/ai-chat/composer/utils/writeAiChatPromptDraft';
import { useSelectAiChatThreadFromNewChat } from '@/ai-chat/hooks/useSelectAiChatThreadFromNewChat';
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { type AiChatPrepromptMode } from '@/ai-chat/types/AiChatPrepromptMode';

export const useApplyAiChatPreprompt = () => {
  const store = useStore();
  const { sendAiChatMessage } = useSendAiChatMessage();
  const { selectAiChatThreadFromNewChat } = useSelectAiChatThreadFromNewChat();

  const applyAiChatPreprompt = async ({
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
      await sendAiChatMessage({
        threadId,
        onThreadChange: selectAiChatThreadFromNewChat,
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
