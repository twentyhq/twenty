import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';

export const agentChatMessageComponentFamilySelector =
  createAtomComponentFamilySelector<
    Nullable<ExtendedUIMessage>,
    { messageId: Nullable<string> }
  >({
    key: 'agentChatMessageComponentFamilySelector',
    get:
      ({ instanceId, surfaceId, familyKey: { messageId } }) =>
      ({ get }) => {
        const currentThreadId = get(agentChatDisplayedThreadState);

        const messages = get(agentChatMessagesComponentFamilyState, {
          instanceId,
          surfaceId,
          familyKey: { threadId: currentThreadId },
        });

        return messages.find((message) => message.id === messageId);
      },
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
