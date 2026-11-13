import { inboxDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { inboxLastMessageIdSelector } from '@/ai/states/selectors/agentChatLastMessageIdSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const inboxNonLastMessageIdsSelector = createAtomSelector<string[]>({
  key: 'inboxNonLastMessageIdsSelector',
  get: ({ get }) => {
    const lastMessageId = get(inboxLastMessageIdSelector);

    return get(inboxDisplayedThreadMessagesSelector)
      .filter((message) => message.id !== lastMessageId)
      .map((message) => message.id);
  },
  areEqual: (previous, next) =>
    previous.length === next.length &&
    previous.every((id, index) => id === next[index]),
});
