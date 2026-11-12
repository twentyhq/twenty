import { useCallback } from 'react';

import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { agentChatThreadLiveFieldsState } from '@/ai/states/agentChatThreadLiveFieldsState';
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
        agentChatThreadLiveFieldsState.atom,
        ({ updateCount, fieldUpdateCountsByThreadId }) => ({
          updateCount: updateCount + 1,
          fieldUpdateCountsByThreadId: {
            ...fieldUpdateCountsByThreadId,
            [update.id]: {
              ...fieldUpdateCountsByThreadId[update.id],
              ...Object.fromEntries(
                Object.keys(update).map((fieldName) => [
                  fieldName,
                  updateCount + 1,
                ]),
              ),
            },
          },
        }),
      );
    },
    [store, upsertRecordsInStore],
  );

  const prependAgentChatThreadToList = useCallback(
    (threadId: string) => {
      const recentThreadListAtom = agentChatThreadListFamilyState.atomFamily(
        getAgentChatThreadListSourceKey(AGENT_CHAT_RECENT_THREAD_LIST_SOURCE),
      );
      const agentChatThreadList = store.get(recentThreadListAtom);

      if (
        agentChatThreadList === null ||
        agentChatThreadList.threadIds.includes(threadId)
      ) {
        return;
      }

      store.set(recentThreadListAtom, {
        ...agentChatThreadList,
        threadIds: [threadId, ...agentChatThreadList.threadIds],
      });
    },
    [store],
  );

  const addAgentChatThread = useCallback(
    (thread: AgentChatThreadUpdate) => {
      applyAgentChatThreadUpdate(thread);
      prependAgentChatThreadToList(thread.id);
    },
    [applyAgentChatThreadUpdate, prependAgentChatThreadToList],
  );

  const addLoadedAgentChatThread = useCallback(
    (thread: AgentChatThreadUpdate) => {
      upsertRecordsInStore({
        partialRecords: [{ __typename: 'AgentChatThread', ...thread }],
      });
      prependAgentChatThreadToList(thread.id);
    },
    [prependAgentChatThreadToList, upsertRecordsInStore],
  );

  return {
    applyAgentChatThreadUpdate,
    addAgentChatThread,
    addLoadedAgentChatThread,
  };
};
