import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

import { Sort } from '../../ui/data/view-bar/types/Sort';

export const sortsScopedFamilyState = createScopedFamilyState<Sort[], string>({
  key: 'sortsScopedFamilyState',
  defaultValue: [],
});
