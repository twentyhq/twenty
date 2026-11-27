import { AGENT_MESSAGE_ROLE } from '@/ai-chat/messages/constants/AgentMessageRole';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatIsMessageBeforeFirstUserMessageFamilySelector =
  createAtomFamilySelector<boolean, { threadId: string; messageId: string }>({
    key: 'aiChatIsMessageBeforeFirstUserMessageFamilySelector',
    get:
      ({ threadId, messageId }) =>
      ({ get }) => {
        const messages = get(aiChatThreadDisplayedMessagesFamilyState, {
          threadId,
        });

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
