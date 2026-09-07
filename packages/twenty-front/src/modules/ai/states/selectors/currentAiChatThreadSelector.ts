import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const currentAiChatThreadSelector = createAtomSelector<
  FlatAgentChatThread | undefined
>({
  key: 'currentAiChatThreadSelector',
  get: ({ get }) => {
    const currentThreadId = get(currentAiChatThreadState);
    const storeItem = get(metadataStoreState, 'agentChatThreads');
    const threads = storeItem.current as FlatAgentChatThread[];

    return threads.find((thread) => thread.id === currentThreadId);
  },
});
