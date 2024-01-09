import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { Sort } from '../types/Sort';

export const onSortSelectScopedState = createStateScopeMap<
  ((sort: Sort) => void) | undefined
>({
  key: 'onSortSelectScopedState',
  defaultValue: undefined,
});
