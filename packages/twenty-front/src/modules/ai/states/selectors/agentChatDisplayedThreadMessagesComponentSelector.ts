import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const agentChatDisplayedThreadMessagesComponentSelector =
  createAtomComponentSelector<ExtendedUIMessage[]>({
    key: 'agentChatDisplayedThreadMessagesComponentSelector',
    componentInstanceContext: AgentChatComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) =>
        get(agentChatMessagesComponentFamilyState, {
          instanceId,
          familyKey: { threadId: get(agentChatDisplayedThreadState) },
        }),
  });
