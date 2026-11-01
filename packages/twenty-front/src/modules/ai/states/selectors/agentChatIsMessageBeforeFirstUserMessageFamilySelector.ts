import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { agentChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const agentChatIsMessageBeforeFirstUserMessageFamilySelector =
  createAtomFamilySelector<boolean, { messageId: string }>({
    key: 'agentChatIsMessageBeforeFirstUserMessageFamilySelector',
    get:
      ({ messageId }) =>
      ({ get }) => {
        const messages = get(agentChatDisplayedThreadMessagesSelector);

        for (const message of messages) {
          if (message.id === messageId) {
            return message.role !== AGENT_MESSAGE_ROLE.USER;
          }

          if (message.role === AGENT_MESSAGE_ROLE.USER) {
            return false;
          }
        }

        return false;
      },
  });
