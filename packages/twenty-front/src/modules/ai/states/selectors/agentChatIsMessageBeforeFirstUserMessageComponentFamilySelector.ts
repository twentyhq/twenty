import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesComponentSelector';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';

export const agentChatIsMessageBeforeFirstUserMessageComponentFamilySelector =
  createAtomComponentFamilySelector<boolean, { messageId: string }>({
    key: 'agentChatIsMessageBeforeFirstUserMessageComponentFamilySelector',
    get:
      ({ instanceId, familyKey: { messageId } }) =>
      ({ get }) => {
        const messages = get(
          agentChatDisplayedThreadMessagesComponentSelector,
          {
            instanceId,
          },
        );

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
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
