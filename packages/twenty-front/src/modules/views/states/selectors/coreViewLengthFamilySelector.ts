import { coreViewsState } from '@/views/states/coreViewState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const coreViewLengthFamilySelector = createAtomSelector<number>({
  key: 'coreViewLengthFamilySelector',
  get: ({ get }) => {
    const coreViews = get(coreViewsState);
    return coreViews?.length ?? 0;
  },
});
