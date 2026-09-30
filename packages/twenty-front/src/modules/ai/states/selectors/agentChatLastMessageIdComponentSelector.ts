import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const agentChatLastMessageIdComponentSelector =
  createAtomComponentSelector<string | null>({
    key: 'agentChatLastMessageIdComponentSelector',
    componentInstanceContext: AgentChatComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const currentThreadId = get(agentChatDisplayedThreadState);

        const messages = get(agentChatMessagesComponentFamilyState, {
          instanceId,
          familyKey: { threadId: currentThreadId },
        });

        const lastMessage = messages.at(-1);

        if (lastMessage?.role === AgentMessageRole.USER) {
          return null;
        }

        return lastMessage?.id ?? null;
      },
  });
