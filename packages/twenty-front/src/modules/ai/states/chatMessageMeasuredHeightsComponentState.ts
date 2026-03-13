import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const chatMessageMeasuredHeightsComponentState =
  createAtomComponentState<Record<string, number>>({
    key: 'chatMessageMeasuredHeightsComponentState',
    defaultValue: {},
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
