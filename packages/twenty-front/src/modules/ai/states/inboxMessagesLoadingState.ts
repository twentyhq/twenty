import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxMessagesLoadingState = createAtomState({
  key: 'inboxMessagesLoadingState',
  defaultValue: false,
});
