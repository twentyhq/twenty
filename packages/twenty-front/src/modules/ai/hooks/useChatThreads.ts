import { useAtomValue } from 'jotai';

import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
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
    threads: sortChatThreadsByLastActivityDesc(agentChatVisibleThreads),
    hasNextPage: false,
    loading: storeEntry.status === 'empty',
    fetchMoreRef: undefined,
  };
};
