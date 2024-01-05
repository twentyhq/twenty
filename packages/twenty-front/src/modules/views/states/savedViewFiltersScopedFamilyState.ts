import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

import { ViewFilter } from '../types/ViewFilter';

export const savedViewFiltersScopedFamilyState = createFamilyStateScopeMap<
  ViewFilter[],
  string
>({
  key: 'savedViewFiltersScopedFamilyState',
  defaultValue: [],
});
