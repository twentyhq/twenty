import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { Sort } from '../types/Sort';

export const onSortSelectScopedState = createScopedState<
  ((sort: Sort) => void) | undefined
>({
  key: 'onSortSelectScopedState',
  defaultValue: undefined,
});
