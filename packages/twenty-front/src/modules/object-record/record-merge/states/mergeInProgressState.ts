import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isMergeInProgressState = createAtomState<boolean>({
  key: 'isMergeInProgress',
  defaultValue: false,
});
