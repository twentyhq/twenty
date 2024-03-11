import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

import { ViewFilter } from '../types/ViewFilter';

export const currentViewFiltersScopedFamilyState = createComponentFamilyState<
  ViewFilter[],
  string
>({
  key: 'currentViewFiltersScopedFamilyState',
  defaultValue: [],
});
