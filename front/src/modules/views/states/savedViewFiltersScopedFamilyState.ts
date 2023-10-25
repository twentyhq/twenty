import { Filter } from '@/ui/data/view-bar/types/Filter';
import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

export const savedViewFiltersScopedFamilyState = createScopedFamilyState<
  Filter[],
  string
>({
  key: 'savedViewFiltersScopedFamilyState',
  defaultValue: [],
});
