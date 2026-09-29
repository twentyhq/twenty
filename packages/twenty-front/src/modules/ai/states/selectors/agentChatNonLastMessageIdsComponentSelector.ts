import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const agentChatNonLastMessageIdsComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'agentChatNonLastMessageIdsComponentSelector',
    componentInstanceContext: AgentChatComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const currentThreadId = get(agentChatDisplayedThreadState);

        const messages = get(agentChatMessagesComponentFamilyState, {
          instanceId,
          familyKey: { threadId: currentThreadId },
        });

        const isLastMessageFromUser =
          messages.at(-1)?.role === AgentMessageRole.USER;
        const messagesWithoutStreamingState = isLastMessageFromUser
          ? messages
          : messages.slice(0, -1);

        return messagesWithoutStreamingState.map((message) => message.id);
      },
    areEqual: (previous, next) =>
      previous.length === next.length &&
      previous.every((id, index) => id === next[index]),
  });
