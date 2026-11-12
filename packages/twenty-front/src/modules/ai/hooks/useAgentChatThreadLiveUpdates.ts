import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadLiveFieldsState } from '@/ai/states/agentChatThreadLiveFieldsState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { applyAgentChatThreadLiveFields } from '@/ai/utils/applyAgentChatThreadLiveFields';

export const useAgentChatThreadLiveUpdates = () => {
  const store = useStore();

  const getLiveUpdateCount = useCallback(
    () => store.get(agentChatThreadLiveFieldsState.atom).updateCount,
    [store],
  );

  const applyLiveUpdatesSince = useCallback(
    ({
      threads,
      updateCount,
    }: {
      threads: AgentChatThreadRecord[];
      updateCount: number;
    }): AgentChatThreadRecord[] => {
      const { fieldUpdateCountsByThreadId } = store.get(
        agentChatThreadLiveFieldsState.atom,
      );

      return threads.map((thread) => {
        const storedThread = store.get(
          agentChatThreadRecordFamilySelector.selectorFamily(thread.id),
        );

        if (!isDefined(storedThread)) {
          return thread;
        }

        return applyAgentChatThreadLiveFields({
          loadedThread: thread,
          storedThread,
          fieldUpdateCounts: fieldUpdateCountsByThreadId[thread.id] ?? {},
          updateCountBeforeLoad: updateCount,
        });
      });
    },
    [store],
  );

  return { getLiveUpdateCount, applyLiveUpdatesSince };
};
