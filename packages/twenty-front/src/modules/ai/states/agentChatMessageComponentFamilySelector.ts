import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
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
        const messages = get(agentChatMessagesComponentState, { instanceId });

        return messages.find((message) => message.id === messageId);
      },
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
