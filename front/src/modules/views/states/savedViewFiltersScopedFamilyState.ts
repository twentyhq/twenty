import { Filter } from '@/ui/data/filter/types/Filter';
import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

export const savedViewFiltersScopedFamilyState = createScopedFamilyState<
  Filter[],
  string
>({
  key: 'savedViewFiltersScopedFamilyState',
  defaultValue: [],
});
