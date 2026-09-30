import { useCallback } from 'react';

import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useStore } from 'jotai';

type AgentChatThreadUpdate = Partial<AgentChatThreadRecord> & {
  id: string;
};

export const useApplyAgentChatThreadUpdate = () => {
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const applyAgentChatThreadUpdate = useCallback(
    (update: AgentChatThreadUpdate) => {
      upsertRecordsInStore({
        partialRecords: [{ __typename: 'AgentChatThread', ...update }],
      });
    },
    [upsertRecordsInStore],
  );

  const addAgentChatThread = useCallback(
    (thread: AgentChatThreadUpdate) => {
      upsertRecordsInStore({
        partialRecords: [{ __typename: 'AgentChatThread', ...thread }],
      });

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
    [store, upsertRecordsInStore],
  );

  return { applyAgentChatThreadUpdate, addAgentChatThread };
};
