import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const skipMessagesSkeletonUntilLoadedState = createAtomState<boolean>({
  key: 'ai/skipMessagesSkeletonUntilLoadedState',
  defaultValue: false,
});
