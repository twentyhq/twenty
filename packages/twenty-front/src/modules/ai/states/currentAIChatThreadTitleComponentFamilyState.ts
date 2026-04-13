import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const currentAIChatThreadTitleComponentFamilyState =
  createAtomComponentFamilyState<string | null, { threadId: string | null }>({
    key: 'currentAIChatThreadTitleComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
