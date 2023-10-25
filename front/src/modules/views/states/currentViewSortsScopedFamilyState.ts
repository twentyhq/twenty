import { Sort } from '@/ui/data/sort/types/Sort';
import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

export const currentViewSortsScopedFamilyState = createScopedFamilyState<
  Sort[],
  string
>({
  key: 'currentViewSortsScopedFamilyState',
  defaultValue: [],
});
