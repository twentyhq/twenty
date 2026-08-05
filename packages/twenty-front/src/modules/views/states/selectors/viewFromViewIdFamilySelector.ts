import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { viewsByIdMapSelector } from '@/views/states/selectors/viewsByIdMapSelector';
import { type View } from '@/views/types/View';

export const viewFromViewIdFamilySelector = createAtomFamilySelector<
  View | undefined,
  { viewId: string }
>({
  key: 'viewFromViewIdFamilySelector',
  get:
    ({ viewId }) =>
    ({ get }) => {
      return get(viewsByIdMapSelector).get(viewId);
    },
  areEqual: (previous, next) => previous === next,
});
