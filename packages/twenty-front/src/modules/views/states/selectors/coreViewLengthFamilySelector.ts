import { coreViewsSelector } from '@/views/states/selectors/coreViewsSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const coreViewLengthFamilySelector = createAtomSelector<number>({
  key: 'coreViewLengthFamilySelector',
  get: ({ get }) => {
    const coreViews = get(coreViewsSelector);
    return coreViews?.length ?? 0;
  },
});
