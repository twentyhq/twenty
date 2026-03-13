import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatMessagesLoadingState = createAtomState({
  key: 'agentChatMessagesLoadingState',
  defaultValue: false,
});
