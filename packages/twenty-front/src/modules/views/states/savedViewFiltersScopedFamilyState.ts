import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

import { ViewFilter } from '../types/ViewFilter';

export const savedViewFiltersScopedFamilyState = createScopedFamilyState<
  ViewFilter[],
  string
>({
  key: 'savedViewFiltersScopedFamilyState',
  defaultValue: [],
});
