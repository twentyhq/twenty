import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const agentChatMessageIdsComponentSelector = createAtomComponentSelector<
  string[]
>({
  key: 'agentChatMessageIdsComponentSelector',
  componentInstanceContext: AgentChatComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const messages = get(agentChatDisplayedThreadMessagesComponentSelector, {
        instanceId,
      });

      return messages.map((message) => message.id);
    },
});
