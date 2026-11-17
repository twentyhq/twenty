import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { aiChatLastMessageIdFamilySelector } from '@/ai/states/selectors/aiChatLastMessageIdFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatNonLastMessageIdsFamilySelector = createAtomFamilySelector<
  string[],
  string
>({
  key: 'aiChatNonLastMessageIdsFamilySelector',
  get:
    (threadId) =>
    ({ get }) => {
      const lastMessageId = get(aiChatLastMessageIdFamilySelector, threadId);

      return get(aiChatMessagesFamilyState, { threadId })
        .filter((message) => message.id !== lastMessageId)
        .map((message) => message.id);
    },
  areEqual: (previous, next) =>
    previous.length === next.length &&
    previous.every((id, index) => id === next[index]),
});
