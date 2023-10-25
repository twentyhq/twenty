import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { SortDefinition } from '../../ui/data/view-bar/types/SortDefinition';

export const availableViewSortsScopedState = createScopedState<
  SortDefinition[]
>({
  key: 'availableViewSortsScopedState',
  defaultValue: [],
});
