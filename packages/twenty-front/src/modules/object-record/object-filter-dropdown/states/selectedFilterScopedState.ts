import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { Filter } from '../types/Filter';

export const selectedFilterScopedState = createScopedState<Filter | undefined>({
  key: 'selectedFilterScopedState',
  defaultValue: undefined,
});
