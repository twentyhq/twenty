import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const agentChatIsStreamingComponentState =
  createAtomComponentState<boolean>({
    key: 'agentChatIsStreamingComponentState',
    defaultValue: false,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
