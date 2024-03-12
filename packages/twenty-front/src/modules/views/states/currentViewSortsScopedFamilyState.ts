import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

import { ViewSort } from '../types/ViewSort';

export const currentViewSortsScopedFamilyState = createComponentFamilyState<
  ViewSort[],
  string
>({
  key: 'currentViewSortsScopedFamilyState',
  defaultValue: [],
});
