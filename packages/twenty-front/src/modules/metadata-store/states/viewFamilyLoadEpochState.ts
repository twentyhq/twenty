import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const viewFamilyLoadEpochState = createAtomState<number>({
  key: 'viewFamilyLoadEpochState',
  defaultValue: 0,
});
