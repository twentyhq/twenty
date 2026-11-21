import { type createStore } from 'jotai';

import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai-chat/constants/AiChatNewThreadDefaultRecipients';
import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/states/composer/aiChatComposerNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';

export const writeAiChatPromptDraft = ({
  store,
  threadId,
  serializedDocument,
}: {
  store: ReturnType<typeof createStore>;
  threadId: string;
  serializedDocument: string;
}) => {
  const isIdleNewChat =
    threadId === store.get(newAiChatThreadIdState.atom) &&
    !store.get(aiChatThreadReplyIsSendingFamilyState.atomFamily({ threadId }));

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
};
