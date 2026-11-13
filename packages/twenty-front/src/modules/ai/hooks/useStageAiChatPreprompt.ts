import { useStore } from 'jotai';

import { INBOX_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/InboxNewThreadDefaultRecipients';
import { inboxDraftsByThreadIdState } from '@/ai/states/inboxDraftsByThreadIdState';
import { inboxIsSendingMessageFamilyState } from '@/ai/states/inboxIsSendingMessageFamilyState';
import { inboxNewThreadRecipientsFamilyState } from '@/ai/states/inboxNewThreadRecipientsFamilyState';
import {
  type AgentChatPrepromptMode,
  agentChatPrepromptState,
} from '@/ai/states/agentChatPrepromptState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Sending reads the draft, not the editor, so it's written before AgentChatPrepromptEffect picks it up.
export const useStageAiChatPreprompt = () => {
  const store = useStore();
  const setInboxDraftsByThreadId = useSetAtomState(inboxDraftsByThreadIdState);
  const setAgentChatPreprompt = useSetAtomState(agentChatPrepromptState);

  const stageAiChatPreprompt = ({
    serializedDocument,
    mode,
  }: {
    serializedDocument: string;
    mode: AgentChatPrepromptMode;
  }) => {
    const newInboxThreadId = store.get(newInboxThreadIdState.atom);
    const threadId =
      store.get(currentInboxThreadState.atom) ?? newInboxThreadId;
    const isIdleNewChat =
      threadId === newInboxThreadId &&
      !store.get(inboxIsSendingMessageFamilyState.atomFamily({ threadId }));

    setInboxDraftsByThreadId((previousDrafts) => ({
      ...previousDrafts,
      [threadId]: serializedDocument,
    }));

    if (isIdleNewChat) {
      store.set(
        inboxNewThreadRecipientsFamilyState.atomFamily(threadId),
        INBOX_NEW_THREAD_DEFAULT_RECIPIENTS,
      );
    }

    setAgentChatPreprompt({ serializedDocument, mode });
  };

  return { stageAiChatPreprompt };
};
