import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';
import { Filter } from '@/views/components/view-bar/types/Filter';

export const currentViewFiltersScopedFamilyState = createScopedFamilyState<
  Filter[],
  string
>({
  key: 'currentViewFiltersScopedFamilyState',
  defaultValue: [],
});
