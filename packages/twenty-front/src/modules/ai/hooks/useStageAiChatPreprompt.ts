import { useStore } from 'jotai';

import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AgentChatNewThreadDefaultRecipients';
import { aiChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { aiChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import {
  type AiChatPrepromptMode,
  aiChatPrepromptState,
} from '@/ai/states/agentChatPrepromptState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
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
    serializedDocument,
    mode,
  }: {
    serializedDocument: string;
    mode: AiChatPrepromptMode;
  }) => {
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
    const threadId =
      store.get(currentAiChatThreadState.atom) ?? newAiChatThreadId;
    const isIdleNewChat =
      threadId === newAiChatThreadId &&
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

    setAiChatPreprompt({ serializedDocument, mode });
  };

  return { stageAiChatPreprompt };
};
