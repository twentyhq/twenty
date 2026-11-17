import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';
import { aiChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesComponentSelector';
import { aiChatLastMessageIdComponentSelector } from '@/ai/states/selectors/aiChatLastMessageIdComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const aiChatNonLastMessageIdsComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'aiChatNonLastMessageIdsComponentSelector',
    componentInstanceContext: AiChatInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const lastMessageId = get(aiChatLastMessageIdComponentSelector, {
          instanceId,
        });

        return get(aiChatDisplayedThreadMessagesComponentSelector, {
          instanceId,
        })
          .filter((message) => message.id !== lastMessageId)
          .map((message) => message.id);
      },
    areEqual: (previous, next) =>
      previous.length === next.length &&
      previous.every((id, index) => id === next[index]),
  });
