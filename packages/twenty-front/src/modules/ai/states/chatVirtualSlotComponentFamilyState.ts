import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export type ChatVirtualSlot = {
  messageId: string;
  offsetTop: number;
};

export const chatVirtualSlotComponentFamilyState =
  createAtomComponentFamilyState<ChatVirtualSlot | null, number>({
    key: 'chatVirtualSlotComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
