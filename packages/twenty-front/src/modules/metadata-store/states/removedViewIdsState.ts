import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const removedViewIdsState = createAtomState<string[]>({
  key: 'removedViewIdsState',
  defaultValue: [],
});
