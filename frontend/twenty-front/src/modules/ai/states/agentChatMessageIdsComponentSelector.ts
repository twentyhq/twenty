import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const agentChatMessageIdsComponentSelector = createAtomComponentSelector<
  string[]
>({
  key: 'agentChatMessageIdsComponentSelector',
  componentInstanceContext: AgentChatComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const currentThreadId = get(agentChatDisplayedThreadState);

      const messages = get(agentChatMessagesComponentFamilyState, {
        instanceId,
        familyKey: { threadId: currentThreadId },
      });

      return messages.map((message) => message.id);
    },
});
