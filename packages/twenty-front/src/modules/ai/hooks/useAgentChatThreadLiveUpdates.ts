import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadLastUpdateCountByIdState } from '@/ai/states/agentChatThreadLastUpdateCountByIdState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

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
      const lastUpdateCountById = store.get(
        agentChatThreadLastUpdateCountByIdState.atom,
      );

      return threads.map((thread) => {
        const storedThread = store.get(
          agentChatThreadRecordFamilySelector.selectorFamily(thread.id),
        );

        return (lastUpdateCountById[thread.id] ?? 0) > updateCount &&
          isDefined(storedThread)
          ? { ...thread, ...storedThread }
          : thread;
      });
    },
    [store],
  );

  return { getLiveUpdateCount, applyLiveUpdatesSince };
};
