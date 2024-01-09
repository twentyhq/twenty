import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { Filter } from '../types/Filter';

export const selectedFilterScopedState = createStateScopeMap<
  Filter | undefined
>({
  key: 'selectedFilterScopedState',
  defaultValue: undefined,
});
