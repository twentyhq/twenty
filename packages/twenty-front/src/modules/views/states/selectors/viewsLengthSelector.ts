import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const viewsLengthSelector = createAtomSelector<number>({
  key: 'viewsLengthSelector',
  get: ({ get }) => {
    const views = get(viewsSelector);
    return views?.length ?? 0;
  },
});
