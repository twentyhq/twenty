import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

import { ViewSort } from '../types/ViewSort';

export const savedViewSortsScopedFamilyState = createScopedFamilyState<
  ViewSort[],
  string
>({
  key: 'savedViewSortsScopedFamilyState',
  defaultValue: [],
});
