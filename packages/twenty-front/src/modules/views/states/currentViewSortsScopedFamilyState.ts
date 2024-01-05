import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

import { ViewSort } from '../types/ViewSort';

export const currentViewSortsScopedFamilyState = createFamilyStateScopeMap<
  ViewSort[],
  string
>({
  key: 'currentViewSortsScopedFamilyState',
  defaultValue: [],
});
