import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const currentAiChatThreadTitleComponentFamilyState =
  createAtomComponentFamilyState<string | null, { threadId: string | null }>({
    key: 'currentAiChatThreadTitleComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
