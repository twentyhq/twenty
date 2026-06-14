import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const processedToolExecutionPartIdsComponentState =
  createAtomComponentState<string[]>({
    key: 'processedToolExecutionPartIdsComponentState',
    defaultValue: [],
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
