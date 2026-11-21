import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { aiChatLastReplyMessageIdFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatLastReplyMessageIdFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatNonLastMessageIdsFamilySelector = createAtomFamilySelector<
  string[],
  string
>({
  key: 'aiChatNonLastMessageIdsFamilySelector',
  get:
    (threadId) =>
    ({ get }) => {
      const lastMessageId = get(
        aiChatLastReplyMessageIdFamilySelector,
        threadId,
      );

      return get(aiChatMessagesFamilyState, { threadId })
        .filter((message) => message.id !== lastMessageId)
        .map((message) => message.id);
    },
  areEqual: (previous, next) =>
    previous.length === next.length &&
    previous.every((id, index) => id === next[index]),
});
