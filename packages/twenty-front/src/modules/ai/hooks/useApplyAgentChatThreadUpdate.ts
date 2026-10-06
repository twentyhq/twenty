import { useCallback } from 'react';

import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
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
      store.set(
        agentChatThreadRecordUpdateCountState.atom,
        (updateCount) => updateCount + 1,
      );
    },
    [store, upsertRecordsInStore],
  );

  const addAgentChatThread = useCallback(
    (thread: AgentChatThreadUpdate) => {
      applyAgentChatThreadUpdate(thread);

      const agentChatThreadList = store.get(agentChatThreadListState.atom);

      if (
        agentChatThreadList === null ||
        agentChatThreadList.threadIds.includes(thread.id)
      ) {
        return;
      }

      store.set(agentChatThreadListState.atom, {
        ...agentChatThreadList,
        threadIds: [thread.id, ...agentChatThreadList.threadIds],
      });
    },
    [applyAgentChatThreadUpdate, store],
  );

  return { applyAgentChatThreadUpdate, addAgentChatThread };
};
