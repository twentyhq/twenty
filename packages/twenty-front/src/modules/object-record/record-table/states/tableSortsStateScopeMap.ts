import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { Sort } from '../../object-sort-dropdown/types/Sort';

export const tableSortsStateScopeMap = createStateScopeMap<Sort[]>({
  key: 'tableSortsStateScopeMap',
  defaultValue: [],
});
