import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const agentChatLastMessageIdComponentSelector =
  createAtomComponentSelector<string | null>({
    key: 'agentChatLastMessageIdComponentSelector',
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

        const lastMessage = messages.at(-1);

        if (lastMessage?.role === AGENT_MESSAGE_ROLE.USER) {
          return null;
        }

        return lastMessage?.id ?? null;
      },
  });
