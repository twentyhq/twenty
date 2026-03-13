import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
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
      ({ instanceId, familyKey: { messageId } }) =>
      ({ get }) => {
        const currentThreadId = get(currentAIChatThreadState);

        const messages = get(agentChatMessagesComponentFamilyState, {
          instanceId,
          familyKey: { threadId: currentThreadId },
        });

        return messages.find((message) => message.id === messageId);
      },
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
