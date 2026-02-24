import { createFamilySelector } from '@/ui/utilities/state/jotai/utils/createFamilySelector';
import { coreViewsState } from '@/views/states/coreViewState';
import { type View } from '@/views/types/View';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

export const coreViewFromViewIdFamilySelector = createFamilySelector<
  View | undefined,
  { viewId: string }
>({
  key: 'coreViewFromViewIdFamilySelector',
  get:
    ({ viewId }) =>
    ({ get }) => {
      const coreViews = get(coreViewsState);
      const views = coreViews.map(convertCoreViewToView);
      return views?.find((view) => view.id === viewId);
    },
});
