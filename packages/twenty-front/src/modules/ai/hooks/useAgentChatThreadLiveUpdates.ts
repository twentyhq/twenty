import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadFieldUpdateCountsState } from '@/ai/states/agentChatThreadFieldUpdateCountsState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { applyAgentChatThreadLiveFields } from '@/ai/utils/applyAgentChatThreadLiveFields';

export const useAgentChatThreadLiveUpdates = () => {
  const store = useStore();

  const getLiveUpdateCount = useCallback(
    () => store.get(agentChatThreadRecordUpdateCountState.atom),
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
      const fieldUpdateCountsById = store.get(
        agentChatThreadFieldUpdateCountsState.atom,
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
          fieldUpdateCounts: fieldUpdateCountsById[thread.id] ?? {},
          updateCountBeforeLoad: updateCount,
        });
      });
    },
    [store],
  );

  return { getLiveUpdateCount, applyLiveUpdatesSince };
};
