import { useStore } from 'jotai';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';

export const useOptimisticallyRestoreOnSend = () => {
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const store = useStore();

  const applyOptimisticRestore = (
    threadId: string,
    optimisticUpdatedAt: string,
  ): (() => void) | null => {
    const thread = store
      .get(agentChatThreadsSelector.atom)
      .find(({ id }) => id === threadId);

    if (!thread?.deletedAt) {
      return null;
    }

    const previousDeletedAt = thread.deletedAt;
    const previousUpdatedAt = thread.updatedAt;

    applyAgentChatThreadUpdate({
      id: threadId,
      deletedAt: null,
      updatedAt: optimisticUpdatedAt,
    });

    return () => {
      applyAgentChatThreadUpdate({
        id: threadId,
        deletedAt: previousDeletedAt,
        updatedAt: previousUpdatedAt,
      });
    };
  };

  return { applyOptimisticRestore };
};
