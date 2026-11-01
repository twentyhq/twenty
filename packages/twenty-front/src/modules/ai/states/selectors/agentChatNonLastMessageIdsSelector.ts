import { agentChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { agentChatLastMessageIdSelector } from '@/ai/states/selectors/agentChatLastMessageIdSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatNonLastMessageIdsSelector = createAtomSelector<string[]>({
  key: 'agentChatNonLastMessageIdsSelector',
  get: ({ get }) => {
    const lastMessageId = get(agentChatLastMessageIdSelector);

    return get(agentChatDisplayedThreadMessagesSelector)
      .filter((message) => message.id !== lastMessageId)
      .map((message) => message.id);
  },
  areEqual: (previous, next) =>
    previous.length === next.length &&
    previous.every((id, index) => id === next[index]),
});
