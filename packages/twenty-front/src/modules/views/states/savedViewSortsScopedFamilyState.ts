import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

import { ViewSort } from '../types/ViewSort';

export const savedViewSortsScopedFamilyState = createComponentFamilyState<
  ViewSort[],
  string
>({
  key: 'savedViewSortsScopedFamilyState',
  defaultValue: [],
});
