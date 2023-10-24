import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

import { Sort } from '../../ui/data/view-bar/types/Sort';

export const savedSortsFamilyState = createScopedFamilyState<Sort[], string>({
  key: 'savedSortsFamilyState',
  defaultValue: [],
});
