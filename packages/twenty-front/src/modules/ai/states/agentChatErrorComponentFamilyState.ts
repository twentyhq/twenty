import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { type AiChatError } from '@/ai/types/AiChatError';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const agentChatErrorComponentFamilyState =
  createAtomComponentFamilyState<
    AiChatError | null,
    { threadId: string | null }
  >({
    key: 'agentChatErrorComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
