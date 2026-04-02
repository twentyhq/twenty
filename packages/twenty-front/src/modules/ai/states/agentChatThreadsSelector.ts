import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatThreadsSelector = createAtomSelector<
  FlatAgentChatThread[]
>({
  key: 'agentChatThreadsSelector',
  get: ({ get }) => {
    const storeItem = get(metadataStoreState, 'agentChatThreads');

    return storeItem.current as FlatAgentChatThread[];
  },
});
