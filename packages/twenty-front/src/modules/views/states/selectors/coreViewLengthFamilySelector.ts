import { coreViewsState } from '@/views/states/coreViewState';
import { createSelectorV2 } from '@/ui/utilities/state/jotai/utils/createSelectorV2';

export const coreViewLengthFamilySelector = createSelectorV2<number>({
  key: 'coreViewLengthFamilySelector',
  get: ({ get }) => {
    const coreViews = get(coreViewsState);
    return coreViews?.length ?? 0;
  },
});
