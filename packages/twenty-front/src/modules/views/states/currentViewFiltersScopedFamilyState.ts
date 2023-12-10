import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

import { ViewFilter } from '../types/ViewFilter';

export const currentViewFiltersScopedFamilyState = createScopedFamilyState<
  ViewFilter[],
  string
>({
  key: 'currentViewFiltersScopedFamilyState',
  defaultValue: [],
});
