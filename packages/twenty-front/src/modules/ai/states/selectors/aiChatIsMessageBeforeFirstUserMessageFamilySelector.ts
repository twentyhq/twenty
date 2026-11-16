import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { aiChatDisplayedThreadMessagesSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatIsMessageBeforeFirstUserMessageFamilySelector =
  createAtomFamilySelector<boolean, { messageId: string }>({
    key: 'aiChatIsMessageBeforeFirstUserMessageFamilySelector',
    get:
      ({ messageId }) =>
      ({ get }) => {
        const messages = get(aiChatDisplayedThreadMessagesSelector);

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
