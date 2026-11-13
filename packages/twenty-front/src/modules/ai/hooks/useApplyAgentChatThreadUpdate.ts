import { useCallback } from 'react';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { aiChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useStore } from 'jotai';

type AiChatThreadUpdate = Partial<AiChatThreadRecord> & {
  id: string;
};

export const useApplyAiChatThreadUpdate = () => {
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  // A list page requested before this update must not overwrite it
  const applyAiChatThreadUpdate = useCallback(
    (update: AiChatThreadUpdate) => {
      upsertRecordsInStore({
        partialRecords: [{ __typename: 'AgentChatThread', ...update }],
      });
      store.set(
        aiChatThreadRecordUpdateCountState.atom,
        (updateCount) => updateCount + 1,
      );
    },
    [store, upsertRecordsInStore],
  );

  const prependAiChatThreadToList = useCallback(
    (threadId: string) => {
      const recentThreadListAtom = inboxThreadListFamilyState.atomFamily(
        getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
      );
      const inboxThreadList = store.get(recentThreadListAtom);

      if (
        inboxThreadList === null ||
        inboxThreadList.threadIds.includes(threadId)
      ) {
        return;
      }

      store.set(recentThreadListAtom, {
        ...inboxThreadList,
        threadIds: [threadId, ...inboxThreadList.threadIds],
      });
    },
    [store],
  );

  const addAiChatThread = useCallback(
    (thread: AiChatThreadUpdate) => {
      applyAiChatThreadUpdate(thread);
      prependAiChatThreadToList(thread.id);
    },
    [applyAiChatThreadUpdate, prependAiChatThreadToList],
  );

  const addLoadedAiChatThread = useCallback(
    (thread: AiChatThreadUpdate) => {
      upsertRecordsInStore({
        partialRecords: [{ __typename: 'AgentChatThread', ...thread }],
      });
      prependAiChatThreadToList(thread.id);
    },
    [prependAiChatThreadToList, upsertRecordsInStore],
  );

  return {
    applyAiChatThreadUpdate,
    addAiChatThread,
    addLoadedAiChatThread,
  };
};
