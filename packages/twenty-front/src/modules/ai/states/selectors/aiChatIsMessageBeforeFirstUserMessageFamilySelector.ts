import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatIsMessageBeforeFirstUserMessageFamilySelector =
  createAtomFamilySelector<boolean, { threadId: string; messageId: string }>({
    key: 'aiChatIsMessageBeforeFirstUserMessageFamilySelector',
    get:
      ({ threadId, messageId }) =>
      ({ get }) => {
        const messages = get(aiChatMessagesFamilyState, { threadId });

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
