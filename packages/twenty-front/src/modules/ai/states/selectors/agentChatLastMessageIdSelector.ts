import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { aiChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const aiChatLastMessageIdSelector = createAtomSelector<string | null>({
  key: 'aiChatLastMessageIdSelector',
  get: ({ get }) => {
    const lastMessage = get(aiChatDisplayedThreadMessagesSelector).at(-1);

    if (lastMessage?.role === AGENT_MESSAGE_ROLE.USER) {
      return null;
    }

    return lastMessage?.id ?? null;
  },
});
