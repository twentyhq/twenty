import { useStore } from 'jotai';

import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai-chat/constants/AiChatNewThreadDefaultRecipients';
import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/states/composer/aiChatComposerNewThreadRecipientsFamilyState';
import {
  type AiChatPrepromptMode,
  aiChatPrepromptState,
} from '@/ai-chat/states/aiChatPrepromptState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Sending reads the draft, not the editor, so it's written before AiChatPrepromptEffect picks it up.
export const useStageAiChatPreprompt = () => {
  const store = useStore();
  const setAiChatComposerDrafts = useSetAtomState(aiChatComposerDraftsState);
  const setAiChatPreprompt = useSetAtomState(aiChatPrepromptState);

  const stageAiChatPreprompt = ({
    threadId,
    serializedDocument,
    mode,
  }: {
    threadId: string;
    serializedDocument: string;
    mode: AiChatPrepromptMode;
  }) => {
    const isIdleNewChat =
      threadId === store.get(newAiChatThreadIdState.atom) &&
      !store.get(
        aiChatThreadReplyIsSendingFamilyState.atomFamily({ threadId }),
      );

    setAiChatComposerDrafts((previousDrafts) => ({
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

    setAiChatPreprompt({ threadId, serializedDocument, mode });
  };

  return { stageAiChatPreprompt };
};
