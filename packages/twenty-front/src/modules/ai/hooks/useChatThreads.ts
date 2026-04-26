import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { agentChatVisibleThreadsSelector } from '@/ai/states/agentChatVisibleThreadsSelector';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useChatThreads = () => {
  const agentChatVisibleThreads = useAtomStateValue(
    agentChatVisibleThreadsSelector,
  );
  const storeEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatThreads'),
  );

  const threads = useMemo(
    () =>
      [...agentChatVisibleThreads].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [agentChatVisibleThreads],
  );

  return {
    threads,
    hasNextPage: false,
    loading: storeEntry.status === 'empty',
    fetchMoreRef: undefined,
  };
};
