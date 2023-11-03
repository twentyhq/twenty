import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

import { ViewSort } from '../types/ViewSort';

export const currentViewSortsScopedFamilyState = createScopedFamilyState<
  ViewSort[],
  string
>({
  key: 'currentViewSortsScopedFamilyState',
  defaultValue: [],
});
