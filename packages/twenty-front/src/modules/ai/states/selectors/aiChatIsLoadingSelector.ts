import { aiChatMessagesLoadingState } from '@/ai/states/aiChatMessagesLoadingState';
import { hasInitializedAiChatThreadsState } from '@/ai/states/hasInitializedAiChatThreadsState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const aiChatIsLoadingSelector = createAtomSelector<boolean>({
  key: 'aiChatIsLoadingSelector',
  get: ({ get }) =>
    get(aiChatMessagesLoadingState) || !get(hasInitializedAiChatThreadsState),
});
