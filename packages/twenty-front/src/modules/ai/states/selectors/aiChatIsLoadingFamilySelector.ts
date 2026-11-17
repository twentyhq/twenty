import { aiChatMessagesLoadingFamilyState } from '@/ai/states/aiChatMessagesLoadingFamilyState';
import { hasInitializedAiChatThreadsState } from '@/ai/states/hasInitializedAiChatThreadsState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatIsLoadingFamilySelector = createAtomFamilySelector<
  boolean,
  string
>({
  key: 'aiChatIsLoadingFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      get(aiChatMessagesLoadingFamilyState, { threadId }) ||
      !get(hasInitializedAiChatThreadsState),
});
