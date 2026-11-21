import { useStore } from 'jotai';

import { writeAiChatPromptDraft } from '@/ai-chat/composer/utils/writeAiChatPromptDraft';
import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai-chat/constants/AiChatSendMessageEventName';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { type AiChatInstanceEventDetail } from '@/ai-chat/types/AiChatInstanceEventDetail';
import { type AiChatPrepromptMode } from '@/ai-chat/types/AiChatPrepromptMode';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';

export const useApplyAiChatPromptInChat = () => {
  const store = useStore();
  const { instanceId, threadId } = useAiChatInstanceOrThrow();

  const applyAiChatPromptInChat = ({
    serializedDocument,
    mode,
  }: {
    serializedDocument: string;
    mode: AiChatPrepromptMode;
  }) => {
    writeAiChatPromptDraft({ store, threadId, serializedDocument });

    if (mode === 'SEND') {
      dispatchBrowserEvent<AiChatInstanceEventDetail>(
        AI_CHAT_SEND_MESSAGE_EVENT_NAME,
        { instanceId },
      );

      return;
    }

    store.set(
      aiChatComposerShouldFocusFamilyState.atomFamily({ threadId }),
      true,
    );
  };

  return { applyAiChatPromptInChat };
};
