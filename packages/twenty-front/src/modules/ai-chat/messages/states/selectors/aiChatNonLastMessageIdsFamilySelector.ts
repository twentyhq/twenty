import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
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

      return get(aiChatThreadDisplayedMessagesFamilyState, { threadId })
        .filter((message) => message.id !== lastMessageId)
        .map((message) => message.id);
    },
  areEqual: (previous, next) =>
    previous.length === next.length &&
    previous.every((id, index) => id === next[index]),
});
