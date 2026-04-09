import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const agentChatMessagesComponentFamilyState =
  createAtomComponentFamilyState<ExtendedUIMessage[], { threadId: string }>({
    key: 'agentChatMessagesComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
