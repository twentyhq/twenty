import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatMessagesLoadingState = createAtomState({
  key: 'aiChatMessagesLoadingState',
  defaultValue: false,
});
