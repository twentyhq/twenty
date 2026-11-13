import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { inboxDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const inboxLastMessageIdSelector = createAtomSelector<string | null>({
  key: 'inboxLastMessageIdSelector',
  get: ({ get }) => {
    const lastMessage = get(inboxDisplayedThreadMessagesSelector).at(-1);

    if (lastMessage?.role === AGENT_MESSAGE_ROLE.USER) {
      return null;
    }

    return lastMessage?.id ?? null;
  },
});
