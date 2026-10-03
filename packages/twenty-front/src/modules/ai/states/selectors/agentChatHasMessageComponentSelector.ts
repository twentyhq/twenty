import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadMessagesComponentSelector } from '@/ai/states/selectors/agentChatDisplayedThreadMessagesComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { isNonEmptyArray } from '@sniptt/guards';

export const agentChatHasMessageComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'agentChatHasMessageComponentSelector',
    componentInstanceContext: AgentChatComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const messages = get(
          agentChatDisplayedThreadMessagesComponentSelector,
          {
            instanceId,
          },
        );

        return isNonEmptyArray(messages);
      },
  });
