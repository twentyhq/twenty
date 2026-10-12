import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { agentChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatLastMessageIdSelector = createAtomSelector<string | null>(
  {
    key: 'agentChatLastMessageIdSelector',
    get: ({ get }) => {
      const lastMessage = get(agentChatDisplayedThreadMessagesSelector).at(-1);

      if (lastMessage?.role === AGENT_MESSAGE_ROLE.USER) {
        return null;
      }

      return lastMessage?.id ?? null;
    },
  },
);
