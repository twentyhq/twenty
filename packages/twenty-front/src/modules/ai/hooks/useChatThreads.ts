import { useAtomValue } from 'jotai';

import { agentChatVisibleThreadsSelector } from '@/ai/states/agentChatVisibleThreadsSelector';
import { sortChatThreadsByUpdatedAtDesc } from '@/ai/utils/sortChatThreadsByUpdatedAtDesc';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useChatThreads = () => {
  const agentChatVisibleThreads = useAtomStateValue(
    agentChatVisibleThreadsSelector,
  );
  const storeEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatThreads'),
  );

  return {
    threads: sortChatThreadsByUpdatedAtDesc(agentChatVisibleThreads),
    hasNextPage: false,
    loading: storeEntry.status === 'empty',
    fetchMoreRef: undefined,
  };
};
