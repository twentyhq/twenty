import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const processedWorkspaceSetupCompletionIdsComponentState =
  createAtomComponentState<string[]>({
    key: 'processedWorkspaceSetupCompletionIdsComponentState',
    defaultValue: [],
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
