import { aiChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { aiChatLastMessageIdSelector } from '@/ai/states/selectors/agentChatLastMessageIdSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const aiChatNonLastMessageIdsSelector = createAtomSelector<string[]>({
  key: 'aiChatNonLastMessageIdsSelector',
  get: ({ get }) => {
    const lastMessageId = get(aiChatLastMessageIdSelector);

    return get(aiChatDisplayedThreadMessagesSelector)
      .filter((message) => message.id !== lastMessageId)
      .map((message) => message.id);
  },
  areEqual: (previous, next) =>
    previous.length === next.length &&
    previous.every((id, index) => id === next[index]),
});
