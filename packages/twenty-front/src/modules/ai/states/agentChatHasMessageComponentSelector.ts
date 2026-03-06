import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { isNonEmptyArray } from '@sniptt/guards';

export const agentChatHasMessageComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'agentChatHasMessageComponentSelector',
    componentInstanceContext: AgentChatComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const messages = get(agentChatMessagesComponentState, { instanceId });

        return isNonEmptyArray(messages);
      },
  });
