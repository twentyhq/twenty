import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { inboxDisplayedThreadMessagesSelector } from '@/ai/states/selectors/inboxDisplayedThreadMessagesSelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const inboxIsMessageBeforeFirstUserMessageFamilySelector =
  createAtomFamilySelector<boolean, { messageId: string }>({
    key: 'inboxIsMessageBeforeFirstUserMessageFamilySelector',
    get:
      ({ messageId }) =>
      ({ get }) => {
        const messages = get(inboxDisplayedThreadMessagesSelector);

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
