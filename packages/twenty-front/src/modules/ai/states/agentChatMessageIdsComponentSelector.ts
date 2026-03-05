import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const agentChatMessageIdsComponentSelector = createAtomComponentSelector<
  string[]
>({
  key: 'agentChatMessageIdsComponentSelector',
  componentInstanceContext: AgentChatComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const messages = get(agentChatMessagesComponentState, { instanceId });

      return messages.map((message) => message.id);
    },
});
