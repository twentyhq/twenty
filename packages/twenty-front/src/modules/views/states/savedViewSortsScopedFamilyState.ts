import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

import { ViewSort } from '../types/ViewSort';

export const savedViewSortsScopedFamilyState = createFamilyStateScopeMap<
  ViewSort[],
  string
>({
  key: 'savedViewSortsScopedFamilyState',
  defaultValue: [],
});
