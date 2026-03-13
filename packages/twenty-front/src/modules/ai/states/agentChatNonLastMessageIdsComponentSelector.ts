import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const agentChatNonLastMessageIdsComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'agentChatNonLastMessageIdsComponentSelector',
    componentInstanceContext: AgentChatComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const currentThreadId = get(currentAIChatThreadState);

        const messages = get(agentChatMessagesComponentFamilyState, {
          instanceId,
          familyKey: { threadId: currentThreadId },
        });

        return messages.slice(0, -1).map((message) => message.id);
      },
    areEqual: (previous, next) =>
      previous.length === next.length &&
      previous.every((id, index) => id === next[index]),
  });
