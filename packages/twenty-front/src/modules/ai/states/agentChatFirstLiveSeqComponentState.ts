import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const agentChatFirstLiveSeqComponentState = createAtomComponentState<
  number | null
>({
  key: 'agentChatFirstLiveSeqComponentState',
  defaultValue: null,
  componentInstanceContext: AgentChatComponentInstanceContext,
});
