import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';

export const agentChatMessagesComponentSelector =
  createAtomComponentFamilySelector<
    Nullable<ExtendedUIMessage>,
    { messageId: string }
  >({
    key: 'agentChatMessagesComponentState',
    get:
      ({ instanceId, familyKey: { messageId } }) =>
      () => {
        const messages = jotaiStore.get(
          agentChatMessagesComponentState.atomFamily({
            instanceId,
          }),
        );

        return messages.find((message) => message.id === messageId);
      },
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
