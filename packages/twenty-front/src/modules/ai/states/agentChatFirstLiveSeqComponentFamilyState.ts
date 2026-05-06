import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const agentChatFirstLiveSeqComponentFamilyState =
  createAtomComponentFamilyState<number | null, { threadId: string | null }>({
    key: 'agentChatFirstLiveSeqComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
