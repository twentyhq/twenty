import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatMessageIdsFamilySelector = createAtomFamilySelector<
  string[],
  string
>({
  key: 'aiChatMessageIdsFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      get(aiChatMessagesFamilyState, { threadId }).map((message) => message.id),
});
