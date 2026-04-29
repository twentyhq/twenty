import { useStore } from 'jotai';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';

export const useOptimisticallyUnarchiveOnSend = () => {
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const store = useStore();

  const applyOptimisticUnarchive = (
    threadId: string,
    optimisticUpdatedAt: string,
  ): (() => void) | null => {
    const entry = store.get(metadataStoreState.atomFamily('agentChatThreads'));
    const threads = (
      entry.status === 'draft-pending' ? entry.draft : entry.current
    ) as FlatAgentChatThread[];
    const thread = threads.find((t) => t.id === threadId);

    if (!thread?.archivedAt) {
      return null;
    }

    const previousArchivedAt = thread.archivedAt;
    const previousUpdatedAt = thread.updatedAt;

    applyAgentChatThreadUpdate({
      id: threadId,
      archivedAt: null,
      updatedAt: optimisticUpdatedAt,
    });

    return () => {
      applyAgentChatThreadUpdate({
        id: threadId,
        archivedAt: previousArchivedAt,
        updatedAt: previousUpdatedAt,
      });
    };
  };

  return { applyOptimisticUnarchive };
};
