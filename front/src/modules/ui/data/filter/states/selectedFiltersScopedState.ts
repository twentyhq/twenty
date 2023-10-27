import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { Filter } from '../types/Filter';

export const selectedFiltersScopedState = createScopedState<Filter[]>({
  key: 'selectedFiltersScopedState',
  defaultValue: [],
});
