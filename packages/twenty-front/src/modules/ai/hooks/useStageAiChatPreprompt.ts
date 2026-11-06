import { useStore } from 'jotai';

import { AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AgentChatNewThreadDefaultRecipients';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import {
  type AgentChatPrepromptMode,
  agentChatPrepromptState,
} from '@/ai/states/agentChatPrepromptState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Sending reads the draft, not the editor, so it's written before AgentChatPrepromptEffect picks it up.
export const useStageAiChatPreprompt = () => {
  const store = useStore();
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const setAgentChatPreprompt = useSetAtomState(agentChatPrepromptState);

  const stageAiChatPreprompt = ({
    serializedDocument,
    mode,
  }: {
    serializedDocument: string;
    mode: AgentChatPrepromptMode;
  }) => {
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
    const threadId =
      store.get(currentAiChatThreadState.atom) ?? newAiChatThreadId;
    const isIdleNewChat =
      threadId === newAiChatThreadId &&
      !store.get(agentChatIsSendingMessageFamilyState.atomFamily({ threadId }));

    setAgentChatDraftsByThreadId((previousDrafts) => ({
      ...previousDrafts,
      [threadId]: serializedDocument,
    }));

    if (isIdleNewChat) {
      store.set(
        agentChatNewThreadRecipientsFamilyState.atomFamily(threadId),
        AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
      );
    }

    setAgentChatPreprompt({ serializedDocument, mode });
  };

  return { stageAiChatPreprompt };
};
