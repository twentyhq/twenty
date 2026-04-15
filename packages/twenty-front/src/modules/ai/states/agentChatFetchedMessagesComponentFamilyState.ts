import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const agentChatFetchedMessagesComponentFamilyState =
  createAtomComponentFamilyState<
    ExtendedUIMessage[],
    { threadId: string | null }
  >({
    key: 'agentChatFetchedMessagesComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
