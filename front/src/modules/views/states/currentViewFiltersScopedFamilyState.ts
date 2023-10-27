import { Filter } from '@/ui/data/filter/types/Filter';
import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

export const currentViewFiltersScopedFamilyState = createScopedFamilyState<
  Filter[],
  string
>({
  key: 'currentViewFiltersScopedFamilyState',
  defaultValue: [],
});
