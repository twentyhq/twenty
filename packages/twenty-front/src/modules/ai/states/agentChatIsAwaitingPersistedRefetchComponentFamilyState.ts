import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const agentChatIsAwaitingPersistedRefetchComponentFamilyState =
  createAtomComponentFamilyState<boolean, { threadId: string | null }>({
    key: 'agentChatIsAwaitingPersistedRefetchComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
