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

    if (!thread?.deletedAt) {
      return null;
    }

    const previousDeletedAt = thread.deletedAt;
    const previousUpdatedAt = thread.updatedAt;
    const previousLastMessageAt = thread.lastMessageAt;

    applyAgentChatThreadUpdate({
      id: threadId,
      deletedAt: null,
      updatedAt: optimisticUpdatedAt,
      lastMessageAt: optimisticUpdatedAt,
    });

    return () => {
      applyAgentChatThreadUpdate({
        id: threadId,
        deletedAt: previousDeletedAt,
        updatedAt: previousUpdatedAt,
        lastMessageAt: previousLastMessageAt,
      });
    };
  };

  return { applyOptimisticUnarchive };
};
