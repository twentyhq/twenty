import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { type View } from '@/views/types/View';

export const viewFromViewIdFamilySelector = createAtomFamilySelector<
  View | undefined,
  { viewId: string }
>({
  key: 'viewFromViewIdFamilySelector',
  get:
    ({ viewId }) =>
    ({ get }) => {
      const views = get(viewsSelector);
      return views?.find((view) => view.id === viewId);
    },
});
