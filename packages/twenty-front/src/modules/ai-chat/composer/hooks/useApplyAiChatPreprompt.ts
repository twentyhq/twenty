import { useStore } from 'jotai';

import { type AiChatPrepromptMode } from '@/ai-chat/types/AiChatPrepromptMode';
import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai-chat/constants/AiChatNewThreadDefaultRecipients';
import { useOpenAiChatThread } from '@/ai-chat/hooks/useOpenAiChatThread';
import { useSendAiChatMessage } from '@/ai-chat/composer/hooks/useSendAiChatMessage';
import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/states/composer/aiChatComposerNewThreadRecipientsFamilyState';
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';

// Sending reads the draft, not the editor, so a prompt can be sent before its chat is on screen
export const useApplyAiChatPreprompt = () => {
  const store = useStore();
  const { sendAiChatMessage } = useSendAiChatMessage();
  const { openAiChatThread } = useOpenAiChatThread();

  const applyAiChatPreprompt = ({
    threadId,
    serializedDocument,
    mode,
    instanceId,
    onThreadChange = (changedThreadId: string) =>
      openAiChatThread({ threadId: changedThreadId }),
  }: {
    threadId: string;
    serializedDocument: string;
    mode: AiChatPrepromptMode;
    instanceId?: string;
    onThreadChange?: (threadId: string) => void;
  }) => {
    const isIdleNewChat =
      threadId === store.get(newAiChatThreadIdState.atom) &&
      !store.get(
        aiChatThreadReplyIsSendingFamilyState.atomFamily({ threadId }),
      );

    store.set(aiChatComposerDraftsState.atom, (previousDrafts) => ({
      ...previousDrafts,
      [threadId]: serializedDocument,
    }));

    if (isIdleNewChat) {
      store.set(
        aiChatComposerNewThreadRecipientsFamilyState.atomFamily(threadId),
        ({ channelId }) => ({
          ...AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
          channelId,
        }),
      );
    }

    if (mode === 'SEND') {
      void sendAiChatMessage({ threadId, instanceId, onThreadChange });

      return;
    }

    store.set(
      aiChatComposerShouldFocusFamilyState.atomFamily({ threadId }),
      true,
    );
  };

  return { applyAiChatPreprompt };
};
