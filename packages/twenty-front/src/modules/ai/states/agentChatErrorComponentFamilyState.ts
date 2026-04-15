import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { type AIChatError } from '@/ai/types/AIChatError';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const agentChatErrorComponentFamilyState =
  createAtomComponentFamilyState<
    AIChatError | null,
    { threadId: string | null }
  >({
    key: 'agentChatErrorComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
