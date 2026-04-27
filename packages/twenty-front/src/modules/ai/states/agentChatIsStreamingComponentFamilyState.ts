import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const agentChatIsStreamingComponentFamilyState =
  createAtomComponentFamilyState<boolean, { threadId: string | null }>({
    key: 'agentChatIsStreamingComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
