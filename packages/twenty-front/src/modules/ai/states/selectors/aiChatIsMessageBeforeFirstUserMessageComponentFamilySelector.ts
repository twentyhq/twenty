import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';
import { aiChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/aiChatDisplayedThreadMessagesComponentSelector';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const aiChatIsMessageBeforeFirstUserMessageComponentFamilySelector =
  createAtomComponentFamilySelector<boolean, { messageId: string }>({
    key: 'aiChatIsMessageBeforeFirstUserMessageComponentFamilySelector',
    componentInstanceContext: AiChatInstanceContext,
    get:
      ({ instanceId, familyKey: { messageId } }) =>
      ({ get }) => {
        const messages = get(aiChatDisplayedThreadMessagesComponentSelector, {
          instanceId,
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
