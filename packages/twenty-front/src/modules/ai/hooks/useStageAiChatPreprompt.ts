import { useStore } from 'jotai';

import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AiChatNewThreadDefaultRecipients';
import { aiChatDraftsByThreadIdState } from '@/ai/states/aiChatDraftsByThreadIdState';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/aiChatIsSendingMessageFamilyState';
import { aiChatNewThreadRecipientsFamilyState } from '@/ai/states/aiChatNewThreadRecipientsFamilyState';
import {
  type AiChatPrepromptMode,
  aiChatPrepromptState,
} from '@/ai/states/aiChatPrepromptState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Sending reads the draft, not the editor, so it's written before AiChatPrepromptEffect picks it up.
export const useStageAiChatPreprompt = () => {
  const store = useStore();
  const setAiChatDraftsByThreadId = useSetAtomState(
    aiChatDraftsByThreadIdState,
  );
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
      !store.get(aiChatIsSendingMessageFamilyState.atomFamily({ threadId }));

    setAiChatDraftsByThreadId((previousDrafts) => ({
      ...previousDrafts,
      [threadId]: serializedDocument,
    }));

    if (isIdleNewChat) {
      store.set(
        aiChatNewThreadRecipientsFamilyState.atomFamily(threadId),
        AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
      );
    }

    setAiChatPreprompt({ threadId, serializedDocument, mode });
  };

  return { stageAiChatPreprompt };
};
