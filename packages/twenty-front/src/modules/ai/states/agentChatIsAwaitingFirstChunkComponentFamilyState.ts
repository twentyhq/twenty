import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const agentChatIsAwaitingFirstChunkComponentFamilyState =
  createAtomComponentFamilyState<boolean, { threadId: string | null }>({
    key: 'agentChatIsAwaitingFirstChunkComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
