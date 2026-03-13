import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const agentChatLastMessageIdComponentSelector =
  createAtomComponentSelector<string | null>({
    key: 'agentChatLastMessageIdComponentSelector',
    componentInstanceContext: AgentChatComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const messages = get(agentChatMessagesComponentState, { instanceId });

        return messages.at(-1)?.id ?? null;
      },
  });
