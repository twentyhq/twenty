import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const agentChatMessageIdsSentInThisSessionComponentState =
  createAtomComponentState<string[]>({
    key: 'agentChatMessageIdsSentInThisSessionComponentState',
    componentInstanceContext: AgentChatComponentInstanceContext,
    defaultValue: [],
  });
