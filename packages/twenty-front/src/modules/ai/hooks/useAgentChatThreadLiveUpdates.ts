import { useStore } from 'jotai';
import { useCallback } from 'react';

import { agentChatThreadLastUpdateCountByIdState } from '@/ai/states/agentChatThreadLastUpdateCountByIdState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';

export const useAgentChatThreadLiveUpdates = () => {
  const store = useStore();

  const getLiveUpdateCount = useCallback(
    () => store.get(agentChatThreadRecordUpdateCountState.atom),
    [store],
  );

  const isUpdatedLiveSince = useCallback(
    ({ threadId, updateCount }: { threadId: string; updateCount: number }) =>
      (store.get(agentChatThreadLastUpdateCountByIdState.atom)[threadId] ?? 0) >
      updateCount,
    [store],
  );

  return { getLiveUpdateCount, isUpdatedLiveSince };
};
