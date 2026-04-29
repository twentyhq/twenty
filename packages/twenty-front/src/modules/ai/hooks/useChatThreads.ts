import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { agentChatThreadsSelector } from '@/ai/states/agentChatThreadsSelector';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useChatThreads = () => {
  const agentChatThreads = useAtomStateValue(agentChatThreadsSelector);
  const storeEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatThreads'),
  );

  const threads = useMemo(
    () =>
      [...agentChatThreads].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [agentChatThreads],
  );

  return {
    threads,
    hasNextPage: false,
    loading: storeEntry.status === 'empty',
    fetchMoreRef: undefined,
  };
};
