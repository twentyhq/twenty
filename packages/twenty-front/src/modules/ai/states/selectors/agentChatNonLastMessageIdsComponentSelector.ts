import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesComponentSelector';
import { agentChatLastMessageIdComponentSelector } from '@/ai/states/selectors/agentChatLastMessageIdComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const agentChatNonLastMessageIdsComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'agentChatNonLastMessageIdsComponentSelector',
    componentInstanceContext: AgentChatComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const messages = get(
          agentChatDisplayedThreadMessagesComponentSelector,
          {
            instanceId,
          },
        );

        const lastMessageId = get(agentChatLastMessageIdComponentSelector, {
          instanceId,
        });

        return messages
          .filter((message) => message.id !== lastMessageId)
          .map((message) => message.id);
      },
    areEqual: (previous, next) =>
      previous.length === next.length &&
      previous.every((id, index) => id === next[index]),
  });
