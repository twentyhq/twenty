import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

import { ViewFilter } from '../types/ViewFilter';

export const currentViewFiltersScopedFamilyState = createFamilyStateScopeMap<
  ViewFilter[],
  string
>({
  key: 'currentViewFiltersScopedFamilyState',
  defaultValue: [],
});
