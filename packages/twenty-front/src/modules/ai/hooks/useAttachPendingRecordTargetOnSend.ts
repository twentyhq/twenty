import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useAttachChatThreadToRecord } from '@/ai/hooks/useAttachChatThreadToRecord';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { type AgentChatDraft } from '@/ai/types/AgentChatDraft';

export const useAttachPendingRecordTargetOnSend = () => {
  const store = useStore();
  const { attachChatThreadToRecord } = useAttachChatThreadToRecord();

  const attachPendingRecordTargetOnSend = async ({
    threadId,
    pendingRecordTarget,
  }: {
    threadId: string;
    pendingRecordTarget: AgentChatDraft['pendingRecordTarget'];
  }) => {
    if (!isDefined(pendingRecordTarget)) {
      return;
    }

    const isAttached = await attachChatThreadToRecord({
      threadId,
      ...pendingRecordTarget,
    });

    // Put back on the thread's draft on failure, so the next message sent in
    // the thread retries it.
    if (!isAttached) {
      store.set(agentChatDraftsByThreadIdState.atom, (previousDrafts) => ({
        ...previousDrafts,
        [threadId]: {
          serializedDocument:
            previousDrafts[threadId]?.serializedDocument ?? '',
          pendingRecordTarget,
        },
      }));
    }
  };

  return { attachPendingRecordTargetOnSend };
};
