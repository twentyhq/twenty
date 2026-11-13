import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasInitializedInboxThreadsState = createAtomState<boolean>({
  key: 'hasInitializedInboxThreadsState',
  defaultValue: false,
});
