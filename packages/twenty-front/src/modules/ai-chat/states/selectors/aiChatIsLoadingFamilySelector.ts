import { aiChatMessagesLoadingFamilyState } from '@/ai-chat/states/aiChatMessagesLoadingFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatIsLoadingFamilySelector = createAtomFamilySelector<
  boolean,
  string
>({
  key: 'aiChatIsLoadingFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      get(aiChatMessagesLoadingFamilyState, { threadId }),
});
