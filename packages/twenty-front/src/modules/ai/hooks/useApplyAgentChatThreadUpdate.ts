import { useCallback } from 'react';

import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadFieldUpdateCountsState } from '@/ai/states/agentChatThreadFieldUpdateCountsState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useStore } from 'jotai';

type AgentChatThreadUpdate = Partial<AgentChatThreadRecord> & {
  id: string;
};

export const useApplyAgentChatThreadUpdate = () => {
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  // A list page requested before this update must not overwrite it
  const applyAgentChatThreadUpdate = useCallback(
    (update: AgentChatThreadUpdate) => {
      upsertRecordsInStore({
        partialRecords: [{ __typename: 'AgentChatThread', ...update }],
      });
      const updateCount =
        store.get(agentChatThreadRecordUpdateCountState.atom) + 1;

      store.set(agentChatThreadRecordUpdateCountState.atom, updateCount);
      store.set(
        agentChatThreadFieldUpdateCountsState.atom,
        (fieldUpdateCountsById) => ({
          ...fieldUpdateCountsById,
          [update.id]: {
            ...fieldUpdateCountsById[update.id],
            ...Object.fromEntries(
              Object.keys(update).map((fieldName) => [fieldName, updateCount]),
            ),
          },
        }),
      );
    },
    [store, upsertRecordsInStore],
  );

  const listAgentChatThread = useCallback(
    (threadId: string) => {
      const agentChatThreadList = store.get(agentChatThreadListState.atom);

      if (
        agentChatThreadList === null ||
        agentChatThreadList.threadIds.includes(threadId)
      ) {
        return;
      }

      store.set(agentChatThreadListState.atom, {
        ...agentChatThreadList,
        threadIds: [threadId, ...agentChatThreadList.threadIds],
      });
    },
    [store],
  );

  const addAgentChatThread = useCallback(
    (thread: AgentChatThreadUpdate) => {
      applyAgentChatThreadUpdate(thread);
      listAgentChatThread(thread.id);
    },
    [applyAgentChatThreadUpdate, listAgentChatThread],
  );

  const addLoadedAgentChatThread = useCallback(
    (thread: AgentChatThreadUpdate) => {
      upsertRecordsInStore({
        partialRecords: [{ __typename: 'AgentChatThread', ...thread }],
      });
      listAgentChatThread(thread.id);
    },
    [listAgentChatThread, upsertRecordsInStore],
  );

  return {
    applyAgentChatThreadUpdate,
    addAgentChatThread,
    addLoadedAgentChatThread,
  };
};
