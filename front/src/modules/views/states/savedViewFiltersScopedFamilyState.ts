import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';
import { Filter } from '@/views/components/view-bar/types/Filter';

export const savedViewFiltersScopedFamilyState = createScopedFamilyState<
  Filter[],
  string
>({
  key: 'savedViewFiltersScopedFamilyState',
  defaultValue: [],
});
