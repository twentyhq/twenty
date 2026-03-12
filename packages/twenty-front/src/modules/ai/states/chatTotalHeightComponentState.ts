import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const chatTotalHeightComponentState = createAtomComponentState<number>({
  key: 'chatTotalHeightComponentState',
  defaultValue: 0,
  componentInstanceContext: AgentChatComponentInstanceContext,
});
